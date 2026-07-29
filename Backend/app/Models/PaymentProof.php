<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentProof extends Model
{
    protected $table = 'payment_proofs';

    protected $fillable = [
        'payment_id',
        'proof_image',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public $timestamps = false;

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
