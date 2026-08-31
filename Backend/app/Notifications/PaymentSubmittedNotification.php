<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Fired when a faculty member submits a proof of payment.
 * Delivered to: all admin users.
 */
class PaymentSubmittedNotification extends Notification
{
    public function __construct(
        public readonly string $facultyName,
        public readonly float  $amount,
        public readonly int    $paymentId
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'payment_submitted',
            'title'      => '🧾 Proof of Payment Submitted',
            'message'    => "{$this->facultyName} submitted a proof of payment (₱" . number_format($this->amount, 2) . ") awaiting verification.",
            'action_tab' => 'Manage Payments',
            'payment_id' => $this->paymentId,
        ];
    }
}
