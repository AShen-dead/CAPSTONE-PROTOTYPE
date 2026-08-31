<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Returns all notifications for the authenticated user, newest first.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'type'       => $n->data['type']       ?? 'info',
                'title'      => $n->data['title']      ?? 'Notification',
                'message'    => $n->data['message']    ?? '',
                'action_tab' => $n->data['action_tab'] ?? null,
                'unread'     => is_null($n->read_at),
                'created_at' => $n->created_at?->toISOString(),
                'date'       => $n->created_at?->diffForHumans(),
            ]);

        return response()->json([
            'data'         => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Mark a single notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (! $notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Marked as read.']);
    }

    /**
     * PATCH /api/notifications/read-all
     * Mark all of the user's notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    /**
     * DELETE /api/notifications/{id}
     * Delete a single notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->where('id', $id)
            ->delete();

        return response()->json(null, 204);
    }
}
