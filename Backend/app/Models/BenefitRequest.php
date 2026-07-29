<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BenefitRequest extends Model
{
    protected $table = 'benefit_requests';

    protected $fillable = [
        'faculty_id',
        'benefit_type_id',
        'request_date',
        'amount_requested',
        'reason',
        'status',
        'approved_by',
        'approved_date',
    ];

    protected $casts = [
        'request_date' => 'date',
        'amount_requested' => 'decimal:2',
        'approved_date' => 'datetime',
    ];

    public $timestamps = false;

    public function facultyMember(): BelongsTo
    {
        return $this->belongsTo(FacultyMember::class, 'faculty_id');
    }

    public function benefitType(): BelongsTo
    {
        return $this->belongsTo(BenefitType::class, 'benefit_type_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BenefitDocument::class, 'request_id');
    }
}
