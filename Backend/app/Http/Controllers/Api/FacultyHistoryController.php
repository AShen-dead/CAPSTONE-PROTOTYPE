<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BenefitRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacultyHistoryController extends Controller
{
    /**
     * GET /api/faculty/payments
     * List all payments specifically for the logged in faculty.
     */
    public function payments(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->facultyMember) return response()->json(['data' => []]);

        $payments = Payment::where('faculty_id', $user->facultyMember->id)
            ->orderByDesc('payment_date')
            ->get();

        return response()->json(['data' => $payments]);
    }

    /**
     * GET /api/faculty/requests
     * List all benefit requests specifically for the logged in faculty.
     */
    public function requests(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->facultyMember) return response()->json(['data' => []]);

        $requests = BenefitRequest::where('faculty_id', $user->facultyMember->id)
            ->with(['benefitType', 'documents'])
            ->orderByDesc('request_date')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $requests]);
    }
}
