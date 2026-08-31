<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\FacultyMember;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * GET /api/reports
     * Fetch logs or Matrix/Excel-style grid based on report_type parameter.
     */
    public function index(Request $request): JsonResponse
    {
        $reportType = $request->query('report_type', 'logs');

        if ($reportType === 'grid' || $reportType === 'Contribution Drive Grid (Matrix/Excel-style)') {
            return $this->generateGridReport($request);
        }

        return $this->generateLogReport($request);
    }

    /**
     * Standard Verified Payment Logs list
     */
    private function generateLogReport(Request $request): JsonResponse
    {
        $query = Payment::with(['facultyMember.user', 'announcement'])
            ->whereIn('status', ['Verified', 'Completed']);

        if ($request->filled('from_date')) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }
        
        if ($request->filled('to_date')) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        $payments = $query->orderBy('payment_date', 'desc')->get();

        $mapped = $payments->map(function ($p) {
            $faculty = $p->facultyMember;
            $name = $faculty 
                ? trim($faculty->first_name . ' ' . $faculty->last_name) 
                : 'Unknown Faculty';
                
            if (empty(trim($name)) && $faculty?->user) {
                $name = $faculty->user->name;
            }

            $dateFormatted = $p->payment_date 
                ? \Carbon\Carbon::parse($p->payment_date)->format('M d, Y') 
                : 'N/A';

            $purpose = 'Monthly Dues';
            if ($p->announcement) {
                $purpose = $p->announcement->beneficiary_name 
                    ? "{$p->announcement->beneficiary_name} ({$p->announcement->benefit_type})"
                    : $p->announcement->title;
            } elseif ($p->payment_method) {
                $purpose = $p->payment_method;
            }

            return [
                'id'           => $p->id,
                'reference_no' => $p->reference_no ?? ('PAY-' . str_pad($p->id, 4, '0', STR_PAD_LEFT)),
                'faculty_name' => $name,
                'department'   => $faculty?->department ?? 'N/A',
                'type'         => $purpose,
                'timestamp'    => $dateFormatted,
                'amount'       => '₱ ' . number_format($p->amount, 2),
            ];
        });

        return response()->json([
            'mode' => 'logs',
            'data' => $mapped
        ]);
    }

    /**
     * Excel-style Cross-tab / Matrix Grid report:
     * Rows: Faculty Members
     * Columns: Contribution Drives (Beneficiaries / Aid events)
     */
    private function generateGridReport(Request $request): JsonResponse
    {
        $facultyMembers = FacultyMember::with('user')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // Find all contribution drive announcements
        $drives = Announcement::where('is_contribution_drive', true)
            ->orderBy('created_at', 'asc')
            ->get();

        // Payments query
        $paymentsQuery = Payment::whereIn('status', ['Verified', 'Completed']);
        if ($request->filled('from_date')) {
            $paymentsQuery->whereDate('payment_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $paymentsQuery->whereDate('payment_date', '<=', $request->to_date);
        }
        $payments = $paymentsQuery->get();

        // Check if there are general payments without announcement_id
        $hasGeneralPayments = $payments->contains(fn($p) => is_null($p->announcement_id));

        // Build dynamic columns
        $columns = [
            ['key' => 'no', 'label' => 'No.'],
            ['key' => 'faculty_name', 'label' => 'Faculty Member'],
            ['key' => 'department', 'label' => 'College / Department'],
        ];

        foreach ($drives as $drive) {
            $label = $drive->beneficiary_name 
                ? "{$drive->beneficiary_name} (" . ($drive->benefit_type ?: 'aid') . ")"
                : $drive->title;
            $columns[] = [
                'key'             => 'drive_' . $drive->id,
                'label'           => $label,
                'announcement_id' => $drive->id,
            ];
        }

        if ($hasGeneralPayments) {
            $columns[] = [
                'key'   => 'general_dues',
                'label' => 'General / Monthly Dues',
            ];
        }

        $columns[] = [
            'key'   => 'total_paid',
            'label' => 'TOTAL PAID',
        ];

        // Group payments by faculty_id
        $paymentsByFaculty = $payments->groupBy('faculty_id');

        $rows = [];
        $columnTotals = array_fill_keys(array_column($columns, 'key'), 0);
        $index = 1;

        foreach ($facultyMembers as $member) {
            $memberPayments = $paymentsByFaculty->get($member->id, collect());
            
            $name = trim($member->first_name . ' ' . $member->last_name);
            if (empty($name) && $member->user) {
                $name = $member->user->name;
            }

            $row = [
                'no'           => $index++,
                'faculty_name' => $name,
                'department'   => $member->department ?? 'N/A',
            ];

            $memberTotal = 0;

            // Fill each drive column
            foreach ($drives as $drive) {
                $colKey = 'drive_' . $drive->id;
                $paidForDrive = $memberPayments->where('announcement_id', $drive->id)->sum('amount');
                if ($paidForDrive > 0) {
                    $row[$colKey] = number_format($paidForDrive, 2);
                    $memberTotal += $paidForDrive;
                    $columnTotals[$colKey] += $paidForDrive;
                } else {
                    $row[$colKey] = '—';
                }
            }

            // Fill general payments column if active
            if ($hasGeneralPayments) {
                $generalPaid = $memberPayments->whereNull('announcement_id')->sum('amount');
                if ($generalPaid > 0) {
                    $row['general_dues'] = number_format($generalPaid, 2);
                    $memberTotal += $generalPaid;
                    $columnTotals['general_dues'] += $generalPaid;
                } else {
                    $row['general_dues'] = '—';
                }
            }

            $row['total_paid'] = '₱ ' . number_format($memberTotal, 2);
            $columnTotals['total_paid'] += $memberTotal;

            $rows[] = $row;
        }

        // Format column totals for the footer
        $formattedTotals = [];
        foreach ($columnTotals as $k => $sum) {
            if ($k === 'no') {
                $formattedTotals[$k] = 'TOTAL';
            } elseif ($k === 'faculty_name' || $k === 'department') {
                $formattedTotals[$k] = '';
            } else {
                $formattedTotals[$k] = $sum > 0 ? '₱ ' . number_format($sum, 2) : '—';
            }
        }

        return response()->json([
            'mode'           => 'grid',
            'columns'        => $columns,
            'rows'           => $rows,
            'column_totals'  => $formattedTotals,
        ]);
    }
}
