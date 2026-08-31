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
     * Return only announcements that are contribution / beneficiary aid drives.
     */
    public function contributionDrives(): JsonResponse
    {
        $drives = Announcement::where('is_contribution_drive', true)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'benefit_type', 'beneficiary_name', 'created_at']);

        return response()->json(['data' => $drives]);
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
            'title'                 => 'required|string|max:255',
            'content'               => 'required|string',
            'is_contribution_drive' => 'nullable|boolean',
            'benefit_type'          => 'nullable|string|max:255',
            'beneficiary_name'      => 'nullable|string|max:255',
        ]);

        $announcement = Announcement::create([
            'title'                 => $validated['title'],
            'content'               => $validated['content'],
            'is_contribution_drive' => $validated['is_contribution_drive'] ?? false,
            'benefit_type'          => $validated['benefit_type'] ?? null,
            'beneficiary_name'      => $validated['beneficiary_name'] ?? null,
            'author_id'             => $request->user()->id,
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
            'title'                 => 'sometimes|required|string|max:255',
            'content'               => 'sometimes|required|string',
            'is_contribution_drive' => 'nullable|boolean',
            'benefit_type'          => 'nullable|string|max:255',
            'beneficiary_name'      => 'nullable|string|max:255',
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
