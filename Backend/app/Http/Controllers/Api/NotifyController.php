<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

/**
 * Simple "fire a notification" endpoint.
 *
 * Faculty → sends to all admins.
 * Admin   → sends to a specific user (user_id required).
 */
class NotifyController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'       => ['required', 'string', 'max:100'],
            'title'      => ['required', 'string', 'max:255'],
            'message'    => ['required', 'string'],
            'action_tab' => ['nullable', 'string', 'max:100'],
            'user_id'    => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $caller = $request->user();

        $payload = [
            'type'       => $validated['type'],
            'title'      => $validated['title'],
            'message'    => $validated['message'],
            'action_tab' => $validated['action_tab'] ?? null,
        ];

        if ($caller->role === 'admin' && ! empty($validated['user_id'])) {
            // Admin sending to a specific user
            $target = User::find($validated['user_id']);
            if ($target) {
                $target->notifications()->create([
                    'id'              => \Illuminate\Support\Str::uuid(),
                    'type'            => 'App\Notifications\GenericNotification',
                    'notifiable_type' => get_class($target),
                    'notifiable_id'   => $target->id,
                    'data'            => $payload,
                    'read_at'         => null,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            }
        } else {
            // Faculty (or any non-admin) → notify all admins
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notifications()->create([
                    'id'              => \Illuminate\Support\Str::uuid(),
                    'type'            => 'App\Notifications\GenericNotification',
                    'notifiable_type' => get_class($admin),
                    'notifiable_id'   => $admin->id,
                    'data'            => $payload,
                    'read_at'         => null,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            }
        }

        return response()->json(['message' => 'Notification sent.'], 201);
    }
}
