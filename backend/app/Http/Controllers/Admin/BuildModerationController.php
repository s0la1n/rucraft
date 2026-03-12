<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Build;
use App\Models\BuildModerationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BuildModerationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 12);
            $status = $request->get('status');

            $query = BuildModerationRequest::query()
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
            Log::error('Error in BuildModerationController@index', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load moderation requests'], 500);
        }
    }

    public function approve(Request $request, BuildModerationRequest $moderationRequest): JsonResponse
    {
        try {
            DB::beginTransaction();

            $build = Build::create([
                'user_id' => $moderationRequest->user_id,
                'title' => $moderationRequest->title,
                'minecraft_version' => $moderationRequest->minecraft_version,
                'image' => $moderationRequest->image,
                'build_file' => $moderationRequest->build_file,
                'description' => $moderationRequest->description,
                'difficulty' => $moderationRequest->difficulty,
                'materials' => $moderationRequest->materials,
                'status' => 'active',
            ]);

            $moderationRequest->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'admin_comment' => $request->get('admin_comment'),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Постройка одобрена и опубликована',
                'data' => ['build_id' => $build->id],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in BuildModerationController@approve', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to approve build'], 500);
        }
    }

    public function reject(Request $request, BuildModerationRequest $moderationRequest): JsonResponse
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

            // Не удаляем файлы - они могут понадобиться для просмотра
            return response()->json([
                'message' => 'Постройка отклонена',
                'data' => ['moderation_request_id' => $moderationRequest->id],
            ]);

        } catch (\Exception $e) {
            Log::error('Error in BuildModerationController@reject', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to reject build'], 500);
        }
    }

    public function show(BuildModerationRequest $moderationRequest): JsonResponse
    {
        try {
            $moderationRequest->load(['user', 'reviewer']);
            return response()->json(['data' => $moderationRequest]);
        } catch (\Exception $e) {
            Log::error('Error in BuildModerationController@show', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load moderation request'], 500);
        }
    }
}
