<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BenefitDocument;
use App\Models\BenefitRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BenefitRequestController extends Controller
{
    /**
     * List benefit requests with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BenefitRequest::with(['facultyMember', 'benefitType', 'documents', 'approvedBy']);

        if ($request->filled('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('benefit_type_id')) {
            $query->where('benefit_type_id', $request->benefit_type_id);
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Submit a new benefit request, optionally uploading supporting documents.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'faculty_id'       => ['required', 'exists:faculty_members,id'],
            'benefit_type_id'  => ['required', 'exists:benefit_types,id'],
            'amount_requested' => ['nullable', 'numeric', 'min:0'],
            'reason'           => ['nullable', 'string'],
            'documents'        => ['nullable', 'array'],
            'documents.*'      => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $benefitRequest = BenefitRequest::create([
                'faculty_id'       => $validated['faculty_id'],
                'benefit_type_id'  => $validated['benefit_type_id'],
                'amount_requested' => $validated['amount_requested'] ?? null,
                'reason'           => $validated['reason'] ?? null,
                'status'           => 'Pending',
            ]);

            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $path = $file->store('benefit-documents', 'public');
                    BenefitDocument::create([
                        'request_id'    => $benefitRequest->id,
                        'document_path' => $path,
                    ]);
                }
            }

            return $benefitRequest->load(['facultyMember', 'benefitType', 'documents']);
        });

        return response()->json(['data' => $result], 201);
    }

    /**
     * Show a single benefit request with all related data.
     */
    public function show(BenefitRequest $benefitRequest): JsonResponse
    {
        return response()->json([
            'data' => $benefitRequest->load(['facultyMember', 'benefitType', 'documents', 'approvedBy']),
        ]);
    }

    /**
     * Update a benefit request (faculty can update while still Pending).
     */
    public function update(Request $request, BenefitRequest $benefitRequest): JsonResponse
    {
        $validated = $request->validate([
            'benefit_type_id'  => ['sometimes', 'exists:benefit_types,id'],
            'amount_requested' => ['nullable', 'numeric', 'min:0'],
            'reason'           => ['nullable', 'string'],
            'status'           => ['nullable', 'string', 'max:50'],
        ]);

        $benefitRequest->update($validated);

        return response()->json([
            'data' => $benefitRequest->fresh()->load(['facultyMember', 'benefitType', 'documents', 'approvedBy']),
        ]);
    }

    /**
     * Approve or reject a benefit request. Admin only.
     */
    public function approve(Request $request, BenefitRequest $benefitRequest): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:Approved,Rejected'],
        ]);

        $benefitRequest->update([
            'status'        => $validated['status'],
            'approved_by'   => $request->user()->id,
            'approved_date' => now(),
        ]);

        return response()->json([
            'data' => $benefitRequest->fresh()->load(['facultyMember', 'benefitType', 'approvedBy']),
        ]);
    }

    /**
     * Delete a benefit request (cascades to its documents).
     */
    public function destroy(BenefitRequest $benefitRequest): JsonResponse
    {
        $benefitRequest->delete();

        return response()->json(null, 204);
    }
}
