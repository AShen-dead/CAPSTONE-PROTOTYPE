<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BenefitRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now   = Carbon::now();
        $month = $now->month;
        $year  = $now->year;

        $verifiedStatuses = ['Verified', 'Completed', 'verified', 'completed'];

        // ── Total contributions (sum of all verified/completed payments) ──────
        $totalContributions = Payment::whereIn('status', $verifiedStatuses)->sum('amount');

        // ── This month contributions ──────────────────────────────────────────
        $thisMonthContributions = Payment::whereIn('status', $verifiedStatuses)
            ->whereMonth('payment_date', $month)
            ->whereYear('payment_date', $year)
            ->sum('amount');

        // ── Last 6 months: build month list safely (avoids end-of-month overflow) ──
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = ($month - $i - 1 + 120) % 12 + 1;
            $y = $year + intdiv($month - $i - 1 + 120, 12) - intdiv(119, 12);
            $target = Carbon::createFromDate($year, $month, 1)->subMonths($i);
            $months[] = $target;
        }

        // Cumulative bar chart
        $cumulativeData   = [];
        $cumulativeLabels = [];
        $runningTotal     = 0;
        foreach ($months as $target) {
            $monthSum = Payment::whereIn('status', $verifiedStatuses)
                ->whereMonth('payment_date', $target->month)
                ->whereYear('payment_date', $target->year)
                ->sum('amount');
            $runningTotal    += (float) $monthSum;
            $cumulativeData[] = $runningTotal;
            $cumulativeLabels[] = $target->format('M');
        }

        // Monthly area chart
        $monthlyData   = [];
        $monthlyLabels = [];
        foreach ($months as $target) {
            $monthSum = Payment::whereIn('status', $verifiedStatuses)
                ->whereMonth('payment_date', $target->month)
                ->whereYear('payment_date', $target->year)
                ->sum('amount');
            $monthlyData[]   = (float) $monthSum;
            $monthlyLabels[] = $target->format('M');
        }

        // ── Pending benefit requests ──────────────────────────────────────────
        $pendingRequests = BenefitRequest::with(['facultyMember.user', 'benefitType'])
            ->orderByDesc('request_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        // Top (featured) pending request
        $topRequest = $pendingRequests->first();
        $mostRecent = null;
        if ($topRequest) {
            $fm = $topRequest->facultyMember;
            $name = $fm ? ($fm->user?->name ?? trim("{$fm->first_name} {$fm->last_name}")) : '—';
            $mostRecent = [
                'benefitType' => $topRequest->benefitType->benefit_name ?? $topRequest->benefitType->name ?? 'Benefit',
                'memberName'  => $name ?: '—',
                'dateFiled'   => $topRequest->request_date
                    ? Carbon::parse($topRequest->request_date)->format('M d, Y')
                    : '—',
                'amount'      => '₱ ' . number_format((float) $topRequest->amount_requested, 2),
                'status'      => $topRequest->status === 'Pending' ? 'Pending Review' : $topRequest->status,
            ];
        }

        // Compact list rows (up to 4 below the featured one)
        $recentList = $pendingRequests->skip(1)->take(4)->map(function ($req) {
            $fm = $req->facultyMember;
            $name = $fm ? ($fm->user?->name ?? trim("{$fm->first_name} {$fm->last_name}")) : '—';
            $status     = $req->status ?? 'Pending';
            $statusType = strtolower($status);
            return [
                'id'          => $req->id,
                'memberName'  => $name ?: '—',
                'benefitType' => $req->benefitType->benefit_name ?? $req->benefitType->name ?? 'Benefit',
                'status'      => $status,
                'statusType'  => $statusType,
            ];
        })->values();

        // ── Recent payments (last 5) ──────────────────────────────────────────
        $recentPayments = Payment::with(['facultyMember.user', 'contribution'])
            ->orderByDesc('payment_date')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                $fm   = $p->facultyMember;
                $user = $fm?->user;
                $name = $fm ? trim("{$fm->first_name} {$fm->last_name}") : '—';
                $initials = collect(explode(' ', $name))
                    ->map(fn($w) => strtoupper($w[0] ?? ''))
                    ->take(2)
                    ->implode('');

                $photo = $user?->profile_photo;
                $photoUrl = $photo ? (str_starts_with($photo, 'http') ? $photo : asset('storage/' . $photo)) : null;

                return [
                    'id'                => $p->id,
                    'member'            => $name,
                    'avatar'            => $initials ?: '??',
                    'profile_photo'     => $photo,
                    'profile_photo_url' => $photoUrl,
                    'date'              => $p->payment_date
                        ? Carbon::parse($p->payment_date)->format('M d, Y')
                        : '—',
                    'type'              => $p->payment_method ?? 'Contribution',
                    'refNo'             => $p->reference_no ?? "PAY-{$p->id}",
                    'amount'            => '₱ ' . number_format((float) $p->amount, 2),
                    'status'            => $p->status ?? 'Pending',
                ];
            });

        return response()->json([
            'total_contributions'       => (float) $totalContributions,
            'this_month_contributions'  => (float) $thisMonthContributions,
            'current_month_label'       => $now->format('F Y'),
            'cumulative_chart'          => [
                'data'   => $cumulativeData,
                'labels' => $cumulativeLabels,
            ],
            'monthly_chart' => [
                'data'   => $monthlyData,
                'labels' => $monthlyLabels,
            ],
            'most_recent_request'   => $mostRecent,
            'recent_requests'       => $recentList,
            'recent_payments'       => $recentPayments,
            'pending_benefit_count' => BenefitRequest::where('status', 'Pending')->count(),
        ]);
    }
}
