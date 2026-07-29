<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacultyMember extends Model
{
    protected $table = 'faculty_members';

    protected $fillable = [
        'user_id',
        'employee_no',
        'first_name',
        'last_name',
        'department',
        'contact_no',
        'status',
    ];

    public $timestamps = false;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(Contribution::class, 'faculty_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'faculty_id');
    }

    public function benefitRequests(): HasMany
    {
        return $this->hasMany(BenefitRequest::class, 'faculty_id');
    }
}
