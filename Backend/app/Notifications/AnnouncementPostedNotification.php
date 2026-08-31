<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AnnouncementPostedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Announcement $announcement,
        public string $authorName
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Stores in the notifications table
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'announcement_posted',
            'title'      => '📢 New Announcement',
            'message'    => "{$this->authorName} posted: \"{$this->announcement->title}\". Click to read.",
            'action_tab' => 'Announcements',
        ];
    }
}
