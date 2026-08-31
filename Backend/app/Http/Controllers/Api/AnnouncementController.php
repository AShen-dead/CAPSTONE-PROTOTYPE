<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the announcements.
     */
    public function index(): JsonResponse
    {
        // Load announcements with author info, latest first
        $announcements = Announcement::with(['author' => function ($query) {
            $query->select('id', 'name', 'role');
        }])->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $announcements]);
    }

    /**
     * Store a newly created announcement in storage.
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $announcement = Announcement::create([
            'title'     => $validated['title'],
            'content'   => $validated['content'],
            'author_id' => $request->user()->id,
        ]);

        $authorName = $request->user()->name;

        // Notify all faculty users
        \App\Models\User::where('role', 'faculty')->get()->each(function ($user) use ($announcement, $authorName) {
            $user->notify(new \App\Notifications\AnnouncementPostedNotification($announcement, $authorName));
        });

        return response()->json(['data' => $announcement->load('author')], 201);
    }

    /**
     * Update the specified announcement in storage.
     */
    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title'   => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
        ]);

        $announcement->update($validated);

        return response()->json(['data' => $announcement->load('author')]);
    }

    /**
     * Remove the specified announcement from storage.
     */
    public function destroy(Request $request, Announcement $announcement): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $announcement->delete();

        return response()->json(null, 204);
    }
}
