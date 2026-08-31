<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Fired when an admin approves or declines a benefit request.
 * Delivered to: the faculty member who filed the request.
 */
class BenefitRequestDecidedNotification extends Notification
{
    public function __construct(
        public readonly string $status,       // 'Approved' or 'Declined'
        public readonly string $benefitType,
        public readonly float  $amount,
        public readonly int    $requestId
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $approved = strtolower($this->status) === 'approved';

        return [
            'type'       => 'benefit_decided',
            'title'      => $approved ? '🎉 Benefit Request Approved' : '❌ Benefit Request Declined',
            'message'    => $approved
                ? "Your {$this->benefitType} request (₱" . number_format($this->amount, 2) . ") has been approved."
                : "Your {$this->benefitType} request (₱" . number_format($this->amount, 2) . ") was declined. Contact the admin for details.",
            'action_tab' => 'My assistance requests',
            'request_id' => $this->requestId,
            'status'     => $this->status,
        ];
    }
}
