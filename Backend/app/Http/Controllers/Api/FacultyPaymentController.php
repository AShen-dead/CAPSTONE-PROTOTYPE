<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentProof;
use App\Models\User;
use App\Notifications\PaymentSubmittedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Handles payment submission from the faculty panel.
 * The faculty user does not need to know their faculty_member id or
 * contribution_id — both are resolved server-side from the auth token.
 */
class FacultyPaymentController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Resolve the faculty_member record from the logged-in user
        $facultyMember = $user->facultyMember;
        if (! $facultyMember) {
            // Auto-create for testing/demo purposes if missing
            $names = explode(' ', $user->name, 2);
            $facultyMember = $user->facultyMember()->create([
                'employee_no' => 'EMP-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
                'first_name'  => $names[0] ?? 'Unknown',
                'last_name'   => $names[1] ?? 'Faculty',
                'department'  => 'General',
                'status'      => 'Active',
            ]);
        }

        $validated = $request->validate([
            'amount'         => ['required', 'numeric', 'min:1'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'reference_no'   => ['nullable', 'string', 'max:100'],
            'payment_date'   => ['nullable', 'date'],
            'proof_image'    => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $result = DB::transaction(function () use ($validated, $request, $user, $facultyMember) {
            $payment = Payment::create([
                'faculty_id'      => $facultyMember->id,
                'contribution_id' => null,   // nullable — no contribution required for self-submission
                'payment_date'    => $validated['payment_date'] ?? now()->toDateString(),
                'amount'          => $validated['amount'],
                'payment_method'  => $validated['payment_method'] ?? null,
                'reference_no'    => $validated['reference_no']   ?? null,
                'status'          => 'Pending',
                'recorded_by'     => $user->id,
            ]);

            // Store proof image if uploaded
            if ($request->hasFile('proof_image')) {
                $path = $request->file('proof_image')->store('proofs', 'public');
                PaymentProof::create([
                    'payment_id'  => $payment->id,
                    'proof_image' => $path,
                ]);
            }

            return $payment->load(['facultyMember', 'contribution', 'proof']);
        });

        // Notify all admins
        $facultyName = trim("{$facultyMember->first_name} {$facultyMember->last_name}");
        User::where('role', 'admin')->get()->each(function ($admin) use ($facultyName, $result) {
            $admin->notify(new PaymentSubmittedNotification(
                facultyName: $facultyName,
                amount:      (float) $result->amount,
                paymentId:   $result->id,
            ));
        });

        return response()->json(['data' => $result], 201);
    }
}
