<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'faculty_id',
        'contribution_id',
        'payment_date',
        'amount',
        'payment_method',
        'reference_no',
        'status',
        'recorded_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public $timestamps = false;

    public function facultyMember(): BelongsTo
    {
        return $this->belongsTo(FacultyMember::class, 'faculty_id');
    }

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class, 'contribution_id');
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function proof(): HasOne
    {
        return $this->hasOne(PaymentProof::class);
    }
}
