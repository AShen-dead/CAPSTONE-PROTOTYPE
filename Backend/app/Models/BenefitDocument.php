<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BenefitDocument extends Model
{
    protected $table = 'benefit_documents';

    protected $fillable = [
        'request_id',
        'document_path',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public $timestamps = false;

    public function benefitRequest(): BelongsTo
    {
        return $this->belongsTo(BenefitRequest::class, 'request_id');
    }
}
