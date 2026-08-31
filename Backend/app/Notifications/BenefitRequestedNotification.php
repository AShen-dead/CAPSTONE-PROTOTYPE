<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Fired when a faculty member files a benefit assistance request.
 * Delivered to: all admin users.
 */
class BenefitRequestedNotification extends Notification
{
    public function __construct(
        public readonly string $facultyName,
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
        return [
            'type'       => 'benefit_requested',
            'title'      => '📋 New Benefit Request Filed',
            'message'    => "{$this->facultyName} filed a {$this->benefitType} benefit request (₱" . number_format($this->amount, 2) . ") pending review.",
            'action_tab' => 'Approve Benefit Requests',
            'request_id' => $this->requestId,
        ];
    }
}
