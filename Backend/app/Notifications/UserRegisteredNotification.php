<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Fired when a new user registers an account.
 * Delivered to: all admin users.
 */
class UserRegisteredNotification extends Notification
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly int    $userId
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'user_registered',
            'title'      => '👤 New Faculty Account Created',
            'message'    => "{$this->name} ({$this->email}) has registered a new faculty account.",
            'action_tab' => 'Manage Members',
            'user_id'    => $this->userId,
        ];
    }
}
