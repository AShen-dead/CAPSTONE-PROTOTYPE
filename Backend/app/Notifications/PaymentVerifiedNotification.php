<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Fired when an admin verifies a faculty payment.
 * Delivered to: the faculty member who submitted the payment.
 */
class PaymentVerifiedNotification extends Notification
{
    public function __construct(
        public readonly float  $amount,
        public readonly string $referenceNo,
        public readonly int    $paymentId
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $ref = $this->referenceNo ?: "PAY-{$this->paymentId}";
        return [
            'type'       => 'payment_verified',
            'title'      => '✅ Payment Verified',
            'message'    => "Your payment of ₱" . number_format($this->amount, 2) . " (Ref: {$ref}) has been verified by the admin.",
            'action_tab' => 'Payment History',
            'payment_id' => $this->paymentId,
        ];
    }
}
