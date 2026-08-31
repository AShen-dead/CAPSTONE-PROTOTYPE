<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BenefitRequest;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacultyDashboardController extends Controller
{
    /**
     * GET /api/faculty/dashboard
     * Returns personal dashboard statistics for the logged-in faculty member.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $facultyMember = $user->facultyMember;

        if (! $facultyMember) {
            return response()->json([
                'total_contributions' => 0,
                'active_requests' => 0,
                'recent_requests' => [],
                'recent_payments' => [],
                'chart_labels' => [],
                'contributions_chart' => [],
                'requests_chart' => []
            ]);
        }

        $verifiedStatuses = ['Verified', 'Completed', 'verified', 'completed'];

        // ── Total Verified Contributions ──────────────────────────────────────
        $totalContributions = Payment::where('faculty_id', $facultyMember->id)
            ->whereIn('status', $verifiedStatuses)
            ->sum('amount');

        // ── Active Requests ───────────────────────────────────────────────────
        $activeRequests = BenefitRequest::where('faculty_id', $facultyMember->id)
            ->whereIn('status', ['Pending', 'To verify', 'Needs Review'])
            ->count();

        // ── Recent Data ───────────────────────────────────────────────────────
        $recentRequests = BenefitRequest::where('faculty_id', $facultyMember->id)
            ->with('benefitType')
            ->orderByDesc('created_at')
            ->take(3)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'type' => $r->benefitType?->name ?? 'Assistance Request',
                'date' => $r->created_at?->format('M d, Y'),
                'amount' => '₱ ' . number_format($r->amount_requested ?? 0, 2),
                'status' => $r->status
            ]);

        $recentPayments = Payment::where('faculty_id', $facultyMember->id)
            ->orderByDesc('payment_date')
            ->take(3)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'type' => $p->payment_method ?? 'Monthly Dues',
                'date' => Carbon::parse($p->payment_date)->format('M d, Y'),
                'refNo' => $p->reference_no,
                'amount' => '₱ ' . number_format($p->amount, 2),
                'status' => $p->status
            ]);

        // ── Chart Data (Last 6 Months) ────────────────────────────────────────
        $now = Carbon::now();
        $months = [];
        $labels = [];
        for ($i = 5; $i >= 0; $i--) {
            $target = $now->copy()->startOfMonth()->subMonths($i);
            $months[] = $target;
            $labels[] = $target->format('M');
        }

        $contributionsChart = [];
        $requestsChart = [];

        foreach ($months as $target) {
            // Sum of verified payments for that month
            $monthSum = Payment::where('faculty_id', $facultyMember->id)
                ->whereIn('status', $verifiedStatuses)
                ->whereMonth('payment_date', $target->month)
                ->whereYear('payment_date', $target->year)
                ->sum('amount');
            $contributionsChart[] = (float) $monthSum;

            // Count of requests for that month
            $monthCount = BenefitRequest::where('faculty_id', $facultyMember->id)
                ->whereMonth('created_at', $target->month)
                ->whereYear('created_at', $target->year)
                ->count();
            $requestsChart[] = $monthCount;
        }

        return response()->json([
            'total_contributions' => $totalContributions,
            'active_requests' => $activeRequests,
            'recent_requests' => $recentRequests,
            'recent_payments' => $recentPayments,
            'chart_labels' => $labels,
            'contributions_chart' => $contributionsChart,
            'requests_chart' => $requestsChart
        ]);
    }
}
