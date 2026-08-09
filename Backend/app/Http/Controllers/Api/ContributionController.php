<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContributionController extends Controller
{
    /**
     * List contributions with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contribution::with('facultyMember');

        if ($request->filled('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by month: expects YYYY-MM format, e.g. ?month=2026-07
        if ($request->filled('month')) {
            [$year, $month] = explode('-', $request->month);
            $query->whereYear('contribution_month', $year)
                  ->whereMonth('contribution_month', $month);
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Create a new contribution record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'faculty_id'         => ['required', 'exists:faculty_members,id'],
            'contribution_month' => ['required', 'date'],
            'amount'             => ['required', 'numeric', 'min:0'],
            'status'             => ['nullable', 'string', 'max:50'],
            'remarks'            => ['nullable', 'string'],
        ]);

        $contribution = Contribution::create($validated);

        return response()->json(['data' => $contribution->load('facultyMember')], 201);
    }

    /**
     * Show a single contribution with its payments.
     */
    public function show(Contribution $contribution): JsonResponse
    {
        return response()->json([
            'data' => $contribution->load(['facultyMember', 'payments']),
        ]);
    }

    /**
     * Update an existing contribution.
     */
    public function update(Request $request, Contribution $contribution): JsonResponse
    {
        $validated = $request->validate([
            'faculty_id'         => ['sometimes', 'exists:faculty_members,id'],
            'contribution_month' => ['sometimes', 'date'],
            'amount'             => ['sometimes', 'numeric', 'min:0'],
            'status'             => ['nullable', 'string', 'max:50'],
            'remarks'            => ['nullable', 'string'],
        ]);

        $contribution->update($validated);

        return response()->json(['data' => $contribution->fresh()->load('facultyMember')]);
    }

    /**
     * Delete a contribution (cascades to its payments).
     */
    public function destroy(Contribution $contribution): JsonResponse
    {
        $contribution->delete();

        return response()->json(null, 204);
    }
}
