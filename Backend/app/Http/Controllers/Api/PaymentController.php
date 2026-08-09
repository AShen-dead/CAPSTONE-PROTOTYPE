<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentProof;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * List all payments with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['facultyMember', 'contribution', 'proof', 'recordedBy']);

        if ($request->filled('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        if ($request->filled('contribution_id')) {
            $query->where('contribution_id', $request->contribution_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Record a new payment, optionally with a proof image upload.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'faculty_id'     => ['required', 'exists:faculty_members,id'],
            'contribution_id'=> ['required', 'exists:contributions,id'],
            'payment_date'   => ['required', 'date'],
            'amount'         => ['required', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'reference_no'   => ['nullable', 'string', 'max:100'],
            'status'         => ['nullable', 'string', 'max:50'],
            'proof_image'    => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $payment = Payment::create([
                'faculty_id'      => $validated['faculty_id'],
                'contribution_id' => $validated['contribution_id'],
                'payment_date'    => $validated['payment_date'],
                'amount'          => $validated['amount'],
                'payment_method'  => $validated['payment_method'] ?? null,
                'reference_no'    => $validated['reference_no'] ?? null,
                'status'          => $validated['status'] ?? 'Pending',
                'recorded_by'     => $request->user()->id,
            ]);

            if ($request->hasFile('proof_image')) {
                $path = $request->file('proof_image')->store('proofs', 'public');
                PaymentProof::create([
                    'payment_id'  => $payment->id,
                    'proof_image' => $path,
                ]);
            }

            return $payment->load(['facultyMember', 'contribution', 'proof', 'recordedBy']);
        });

        return response()->json(['data' => $result], 201);
    }

    /**
     * Show a single payment with all related data.
     */
    public function show(Payment $payment): JsonResponse
    {
        return response()->json([
            'data' => $payment->load(['facultyMember', 'contribution', 'proof', 'recordedBy']),
        ]);
    }

    /**
     * Update a payment record and optionally replace its proof image.
     */
    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'payment_date'   => ['sometimes', 'date'],
            'amount'         => ['sometimes', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'reference_no'   => ['nullable', 'string', 'max:100'],
            'status'         => ['nullable', 'string', 'max:50'],
            'proof_image'    => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        DB::transaction(function () use ($validated, $request, $payment) {
            $payment->update([
                'payment_date'   => $validated['payment_date'] ?? $payment->payment_date,
                'amount'         => $validated['amount'] ?? $payment->amount,
                'payment_method' => array_key_exists('payment_method', $validated)
                    ? $validated['payment_method']
                    : $payment->payment_method,
                'reference_no'   => array_key_exists('reference_no', $validated)
                    ? $validated['reference_no']
                    : $payment->reference_no,
                'status'         => $validated['status'] ?? $payment->status,
            ]);

            if ($request->hasFile('proof_image')) {
                $path = $request->file('proof_image')->store('proofs', 'public');
                if ($payment->proof) {
                    $payment->proof->update(['proof_image' => $path]);
                } else {
                    PaymentProof::create([
                        'payment_id'  => $payment->id,
                        'proof_image' => $path,
                    ]);
                }
            }
        });

        return response()->json([
            'data' => $payment->fresh()->load(['facultyMember', 'contribution', 'proof', 'recordedBy']),
        ]);
    }

    /**
     * Delete a payment (cascades to its proof).
     */
    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json(null, 204);
    }
}
