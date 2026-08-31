<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * GET /api/reports
     * Fetch logs/reports based on filters.
     * Currently strictly serves Verified Payments logs as requested.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['facultyMember.user'])
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
                
            // Fallback to user name if first/last name are empty
            if (empty(trim($name)) && $faculty?->user) {
                $name = $faculty->user->name;
            }

            // Parse payment_date using Carbon
            $dateFormatted = $p->payment_date 
                ? \Carbon\Carbon::parse($p->payment_date)->format('M d, Y') 
                : 'N/A';

            return [
                'id'           => $p->id,
                'reference_no' => $p->reference_no ?? ('PAY-' . str_pad($p->id, 4, '0', STR_PAD_LEFT)),
                'faculty_name' => $name,
                'department'   => $faculty?->department ?? 'N/A',
                'type'         => $p->payment_method ?? 'Monthly Dues',
                'timestamp'    => $dateFormatted,
                'amount'       => '₱ ' . number_format($p->amount, 2),
            ];
        });

        return response()->json([
            'data' => $mapped
        ]);
    }
}
