<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BenefitType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BenefitTypeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => BenefitType::all(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'benefit_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'maximum_amount' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $benefitType = BenefitType::create($validated);

        return response()->json([
            'data' => $benefitType,
        ], 201);
    }

    public function show(BenefitType $benefitType): JsonResponse
    {
        return response()->json([
            'data' => $benefitType,
        ], 200);
    }

    public function update(Request $request, BenefitType $benefitType): JsonResponse
    {
        $validated = $request->validate([
            'benefit_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'maximum_amount' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $benefitType->update($validated);

        return response()->json([
            'data' => $benefitType->fresh(),
        ], 200);
    }

    public function destroy(BenefitType $benefitType): JsonResponse
    {
        $benefitType->delete();

        return response()->json(null, 204);
    }
}
