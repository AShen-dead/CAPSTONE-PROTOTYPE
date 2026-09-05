<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BenefitRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $now          = Carbon::now();
        $currentMonth = $now->month;
        $currentYear  = $now->year;

        $verifiedStatuses = ['Verified', 'Completed', 'verified', 'completed'];

        // Determine available years from payments and ensure recent years are present
        $dbYears = Payment::whereNotNull('payment_date')
            ->get(['payment_date'])
            ->map(fn($p) => (int) Carbon::parse($p->payment_date)->format('Y'))
            ->unique()
            ->toArray();

        $availableYears = collect(array_merge([$currentYear, $currentYear - 1, $currentYear - 2], $dbYears))
            ->filter()
            ->unique()
            ->sortDesc()
            ->values()
            ->toArray();

        $selectedYear = $request->query('year', (string) $currentYear);
        $isAllYears   = strtolower((string) $selectedYear) === 'all';

        // ── Overall all-time total ────────────────────────────────────────────
        $allTimeTotal = (float) Payment::whereIn('status', $verifiedStatuses)->sum('amount');

        if ($isAllYears) {
            $totalContributions = $allTimeTotal;
            $statSubtitle       = "All-time overall collected funds";

            $thisMonthContributions = (float) Payment::whereIn('status', $verifiedStatuses)
                ->whereMonth('payment_date', $currentMonth)
                ->whereYear('payment_date', $currentYear)
                ->sum('amount');
            $currentMonthLabel = $now->format('F Y');
            $monthSubtitle     = "{$currentMonthLabel} faculty union contribution activity";

            // Rolling last 6 months for 'all'
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $target = Carbon::createFromDate($currentYear, $currentMonth, 1)->subMonths($i);
                $months[] = $target;
            }

            $cumulativeData   = [];
            $cumulativeLabels = [];
            $runningTotal     = 0;
            foreach ($months as $target) {
                $monthSum = (float) Payment::whereIn('status', $verifiedStatuses)
                    ->whereMonth('payment_date', $target->month)
                    ->whereYear('payment_date', $target->year)
                    ->sum('amount');
                $runningTotal    += $monthSum;
                $cumulativeData[] = $runningTotal;
                $cumulativeLabels[] = $target->format('M');
            }

            $monthlyData   = [];
            $monthlyLabels = [];
            foreach ($months as $target) {
                $monthSum = (float) Payment::whereIn('status', $verifiedStatuses)
                    ->whereMonth('payment_date', $target->month)
                    ->whereYear('payment_date', $target->year)
                    ->sum('amount');
                $monthlyData[]   = $monthSum;
                $monthlyLabels[] = $target->format('M');
            }
        } else {
            $yearInt = (int) $selectedYear;
            $yearTotal = (float) Payment::whereIn('status', $verifiedStatuses)
                ->whereYear('payment_date', $yearInt)
                ->sum('amount');

            $totalContributions = $yearTotal;
            $statSubtitle       = "Total verified collections for FY {$yearInt}";

            if ($yearInt === $currentYear) {
                $thisMonthContributions = (float) Payment::whereIn('status', $verifiedStatuses)
                    ->whereMonth('payment_date', $currentMonth)
                    ->whereYear('payment_date', $currentYear)
                    ->sum('amount');
                $currentMonthLabel = $now->format('F Y');
                $monthSubtitle     = "{$currentMonthLabel} contribution activity";
            } else {
                $thisMonthContributions = $yearTotal;
                $currentMonthLabel = "Annual {$yearInt}";
                $monthSubtitle     = "Full-year collections for {$yearInt}";
            }

            // 12 months (Jan - Dec) for the selected year
            $cumulativeData   = [];
            $cumulativeLabels = [];
            $monthlyData      = [];
            $monthlyLabels    = [];
            $runningTotal     = 0;

            for ($m = 1; $m <= 12; $m++) {
                $monthCarbon = Carbon::createFromDate($yearInt, $m, 1);
                $isFutureMonth = ($yearInt === $currentYear && $m > $currentMonth);

                $monthSum = 0;
                if (!$isFutureMonth) {
                    $monthSum = (float) Payment::whereIn('status', $verifiedStatuses)
                        ->whereMonth('payment_date', $m)
                        ->whereYear('payment_date', $yearInt)
                        ->sum('amount');
                    $runningTotal += $monthSum;
                }

                $cumulativeData[]   = $isFutureMonth ? 0 : $runningTotal;
                $cumulativeLabels[] = $monthCarbon->format('M');

                $monthlyData[]   = $monthSum;
                $monthlyLabels[] = $monthCarbon->format('M');
            }
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
            'selected_year'             => (string) $selectedYear,
            'available_years'           => $availableYears,
            'stat_subtitle'             => $statSubtitle,
            'month_subtitle'            => $monthSubtitle,
            'all_time_total'            => (float) $allTimeTotal,
            'total_contributions'       => (float) $totalContributions,
            'this_month_contributions'  => (float) $thisMonthContributions,
            'current_month_label'       => $currentMonthLabel,
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
