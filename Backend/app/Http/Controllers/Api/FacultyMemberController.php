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
        $query = FacultyMember::with('user');

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('employee_no', 'like', "%{$search}%");
            });
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Create a new faculty member along with their User account (atomic transaction).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email'],
            'password'    => ['required', 'string', 'min:8'],
            'employee_no' => ['required', 'string', 'unique:faculty_members,employee_no'],
            'first_name'  => ['required', 'string', 'max:255'],
            'last_name'   => ['required', 'string', 'max:255'],
            'department'  => ['nullable', 'string', 'max:255'],
            'contact_no'  => ['nullable', 'string', 'max:50'],
            'status'      => ['nullable', 'string', 'max:50'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'faculty',
            ]);

            $faculty = FacultyMember::create([
                'user_id'     => $user->id,
                'employee_no' => $validated['employee_no'],
                'first_name'  => $validated['first_name'],
                'last_name'   => $validated['last_name'],
                'department'  => $validated['department'] ?? null,
                'contact_no'  => $validated['contact_no'] ?? null,
                'status'      => $validated['status'] ?? 'Active',
            ]);

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
