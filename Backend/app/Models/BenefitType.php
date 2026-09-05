<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BenefitType extends Model
{
    protected $table = 'benefit_types';

    protected $fillable = [
        'benefit_name',
        'description',
        'maximum_amount',
        'status',
    ];

    protected $casts = [
        'maximum_amount' => 'decimal:2',
    ];

    public $timestamps = false;

    public function getNameAttribute(): string
    {
        return $this->benefit_name ?? '';
    }

    public function benefitRequests(): HasMany
    {
        return $this->hasMany(BenefitRequest::class, 'benefit_type_id');
    }
}
