<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FacultyMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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

            $photo = $fm->user?->profile_photo;
            $photoUrl = $photo ? (str_starts_with($photo, 'http') ? $photo : asset('storage/' . $photo)) : null;

            return [
                'id'                  => $fm->id,
                'user_id'             => $fm->user_id,
                'employee_no'         => $fm->employee_no,
                'name'                => $fm->user?->name ?? trim($fm->first_name . ' ' . $fm->last_name),
                'email'               => $fm->user?->email,
                'department'          => $fm->department ?: 'General',
                'contact_no'          => $fm->contact_no,
                'status'              => $fm->status ?: 'Active',
                'profile_photo'       => $photo,
                'profile_photo_url'   => $photoUrl,
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
            'profile_photo'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $password = $validated['password'] ?? 'password123';

            $photoPath = null;
            if ($request->hasFile('profile_photo')) {
                $photoPath = $request->file('profile_photo')->store('profile_photos', 'public');
            }

            $user = User::create([
                'name'          => $validated['name'],
                'email'         => $validated['email'],
                'password'      => Hash::make($password),
                'role'          => 'faculty',
                'profile_photo' => $photoPath,
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
            'name'          => ['sometimes', 'string', 'max:255'],
            'email'         => ['sometimes', 'email', 'unique:users,email,' . $facultyMember->user_id],
            'employee_no'   => ['sometimes', 'string', 'unique:faculty_members,employee_no,' . $facultyMember->id],
            'first_name'    => ['sometimes', 'string', 'max:255'],
            'last_name'     => ['sometimes', 'string', 'max:255'],
            'department'    => ['nullable', 'string', 'max:255'],
            'contact_no'    => ['nullable', 'string', 'max:50'],
            'status'        => ['nullable', 'string', 'max:50'],
            'profile_photo' => ['nullable'],
        ]);

        $user = $facultyMember->user;

        if ($request->hasFile('profile_photo')) {
            if ($user && $user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            $path = $request->file('profile_photo')->store('profile_photos', 'public');
            if ($user) {
                $user->update(['profile_photo' => $path]);
            }
        } elseif ($request->input('profile_photo') === 'remove' || $request->input('remove_photo') === 'true') {
            if ($user && $user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            if ($user) {
                $user->update(['profile_photo' => null]);
            }
        }

        if ($user && isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
            $names = explode(' ', $validated['name'], 2);
            $facultyMember->first_name = $names[0] ?? $validated['name'];
            $facultyMember->last_name = $names[1] ?? '';
        }
        if ($user && isset($validated['email'])) {
            $user->update(['email' => $validated['email']]);
        }

        $facultyMember->fill(collect($validated)->except(['name', 'email', 'profile_photo', 'remove_photo'])->toArray());
        $facultyMember->save();

        return response()->json(['data' => $facultyMember->fresh()->load('user')]);
    }

    /**
     * Delete a faculty member (cascades to their user account).
     */
    public function destroy(FacultyMember $facultyMember): JsonResponse
    {
        $user = $facultyMember->user;
        if ($user && $user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
            Storage::disk('public')->delete($user->profile_photo);
        }
        $facultyMember->delete();
        if ($user) {
            $user->delete();
        }

        return response()->json(null, 204);
    }
}
