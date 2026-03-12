<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Seed;
use App\Models\SeedModerationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SeedModerationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 12);
            $status = $request->get('status');

            $query = SeedModerationRequest::query()
                ->with(['user', 'reviewer'])
                ->orderByDesc('created_at');

            if ($status && $status !== '') {
                $query->where('status', $status);
            }

            $requests = $query->paginate($perPage);

            return response()->json([
                'data' => $requests->items(),
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error in SeedModerationController@index', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load moderation requests'], 500);
        }
    }

    public function approve(Request $request, SeedModerationRequest $moderationRequest): JsonResponse
    {
        try {
            DB::beginTransaction();

            $seed = Seed::create([
                'user_id' => $moderationRequest->user_id,
                'title' => $moderationRequest->title,
                'seed_number' => $moderationRequest->seed_number,
                'version' => $moderationRequest->version,
                'minecraft_release' => $moderationRequest->minecraft_release,
                'coordinates' => $moderationRequest->coordinates,
                'image' => $moderationRequest->image,
                'description' => $moderationRequest->description,
                'status' => 'active',
            ]);

            $moderationRequest->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'admin_comment' => $request->get('admin_comment'),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Сид одобрен и опубликован',
                'data' => ['seed_id' => $seed->id],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in SeedModerationController@approve', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to approve seed'], 500);
        }
    }

    public function reject(Request $request, SeedModerationRequest $moderationRequest): JsonResponse
    {
        try {
            $reason = $request->get('admin_comment');

            if (!$reason || trim($reason) === '') {
                return response()->json(['error' => 'Укажите причину отклонения'], 422);
            }

            $moderationRequest->update([
                'status' => 'rejected',
                'reviewed_by' => $request->user()->id,
                'admin_comment' => $reason,
            ]);

            return response()->json([
                'message' => 'Сид отклонён',
                'data' => ['moderation_request_id' => $moderationRequest->id],
            ]);

        } catch (\Exception $e) {
            Log::error('Error in SeedModerationController@reject', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to reject seed'], 500);
        }
    }

    public function show(SeedModerationRequest $moderationRequest): JsonResponse
    {
        try {
            $moderationRequest->load(['user', 'reviewer']);
            return response()->json(['data' => $moderationRequest]);
        } catch (\Exception $e) {
            Log::error('Error in SeedModerationController@show', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load moderation request'], 500);
        }
    }
}
