<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contribution extends Model
{
    protected $table = 'contributions';

    protected $fillable = [
        'faculty_id',
        'contribution_month',
        'amount',
        'status',
        'remarks',
    ];

    protected $casts = [
        'contribution_month' => 'date',
        'amount' => 'decimal:2',
    ];

    public $timestamps = false;

    public function facultyMember(): BelongsTo
    {
        return $this->belongsTo(FacultyMember::class, 'faculty_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'contribution_id');
    }
}
