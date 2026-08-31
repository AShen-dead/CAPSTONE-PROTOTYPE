<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    protected $table = 'announcements';

    protected $fillable = [
        'title',
        'content',
        'author_id',
        'is_contribution_drive',
        'benefit_type',
        'beneficiary_name',
    ];

    protected $casts = [
        'is_contribution_drive' => 'boolean',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'announcement_id');
    }
}
