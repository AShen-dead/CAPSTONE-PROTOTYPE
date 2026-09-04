<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FacultyMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FacultyMemberController extends Controller
{
    /**
     * List all faculty members with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        // Auto-create FacultyMember profiles for any real faculty users that don't have one yet
        $unlinkedUsers = User::where('role', 'faculty')->doesntHave('facultyMember')->get();
        foreach ($unlinkedUsers as $u) {
            $parts = explode(' ', $u->name, 2);
            FacultyMember::create([
                'user_id'     => $u->id,
                'employee_no' => 'EMP-' . str_pad($u->id, 4, '0', STR_PAD_LEFT),
                'first_name'  => $parts[0] ?? $u->name,
                'last_name'   => $parts[1] ?? '',
                'department'  => 'General',
                'status'      => 'Active',
            ]);
        }

        $query = FacultyMember::with('user')->whereHas('user', function ($q) {
            $q->where('role', 'faculty');
        });

        if ($request->filled('department') && $request->department !== 'All') {
            $query->where('department', $request->department);
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('employee_no', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $members = $query->get()->map(function ($fm) {
            $total = (float) $fm->payments()
                ->where('status', 'Verified')
                ->sum('amount');

            return [
                'id'                  => $fm->id,
                'user_id'             => $fm->user_id,
                'employee_no'         => $fm->employee_no,
                'name'                => $fm->user?->name ?? trim($fm->first_name . ' ' . $fm->last_name),
                'email'               => $fm->user?->email,
                'department'          => $fm->department ?: 'General',
                'contact_no'          => $fm->contact_no,
                'status'              => $fm->status ?: 'Active',
                'profile_photo'       => $fm->user?->profile_photo,
                'total_contributions' => $total,
            ];
        });

        return response()->json(['data' => $members]);
    }

    /**
     * Create a new faculty member along with their User account (atomic transaction).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                 => ['required', 'string', 'max:255'],
            'email'                => ['required', 'email', 'unique:users,email'],
            'password'             => ['nullable', 'string', 'min:6'],
            'employee_no'          => ['nullable', 'string', 'unique:faculty_members,employee_no'],
            'first_name'           => ['nullable', 'string', 'max:255'],
            'last_name'            => ['nullable', 'string', 'max:255'],
            'department'           => ['nullable', 'string', 'max:255'],
            'contact_no'           => ['nullable', 'string', 'max:50'],
            'status'               => ['nullable', 'string', 'max:50'],
            'initial_contribution' => ['nullable', 'numeric', 'min:0'],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $password = $validated['password'] ?? 'password123';

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($password),
                'role'     => 'faculty',
            ]);

            $names = explode(' ', $validated['name'], 2);
            $firstName = $validated['first_name'] ?? ($names[0] ?? $validated['name']);
            $lastName = $validated['last_name'] ?? ($names[1] ?? 'Faculty');
            $empNo = !empty($validated['employee_no']) 
                ? $validated['employee_no'] 
                : 'EMP-' . str_pad($user->id, 4, '0', STR_PAD_LEFT);

            $faculty = FacultyMember::create([
                'user_id'     => $user->id,
                'employee_no' => $empNo,
                'first_name'  => $firstName,
                'last_name'   => $lastName,
                'department'  => $validated['department'] ?? 'General',
                'contact_no'  => $validated['contact_no'] ?? null,
                'status'      => $validated['status'] ?? 'Active',
            ]);

            if (!empty($validated['initial_contribution']) && $validated['initial_contribution'] > 0) {
                \App\Models\Payment::create([
                    'faculty_id'      => $faculty->id,
                    'payment_date'    => now()->toDateString(),
                    'amount'          => $validated['initial_contribution'],
                    'payment_method'  => 'Cash',
                    'reference_no'    => 'INIT-' . strtoupper(uniqid()),
                    'status'          => 'Verified',
                    'recorded_by'     => $request->user()?->id,
                ]);
            }

            return $faculty->load('user');
        });

        return response()->json(['data' => $result], 201);
    }

    /**
     * Show a single faculty member with all their related data.
     */
    public function show(FacultyMember $facultyMember): JsonResponse
    {
        return response()->json([
            'data' => $facultyMember->load(['user', 'contributions', 'payments', 'benefitRequests']),
        ]);
    }

    /**
     * Update a faculty member's profile.
     */
    public function update(Request $request, FacultyMember $facultyMember): JsonResponse
    {
        $validated = $request->validate([
            'employee_no' => ['sometimes', 'string', 'unique:faculty_members,employee_no,' . $facultyMember->id],
            'first_name'  => ['sometimes', 'string', 'max:255'],
            'last_name'   => ['sometimes', 'string', 'max:255'],
            'department'  => ['nullable', 'string', 'max:255'],
            'contact_no'  => ['nullable', 'string', 'max:50'],
            'status'      => ['nullable', 'string', 'max:50'],
        ]);

        $facultyMember->update($validated);

        return response()->json(['data' => $facultyMember->fresh()->load('user')]);
    }

    /**
     * Delete a faculty member (cascades to their user account).
     */
    public function destroy(FacultyMember $facultyMember): JsonResponse
    {
        $facultyMember->delete();

        return response()->json(null, 204);
    }
}
