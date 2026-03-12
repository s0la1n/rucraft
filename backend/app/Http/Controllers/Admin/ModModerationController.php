<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mode;
use App\Models\ModModerationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ModModerationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 12);
            $status = $request->get('status');

            $query = ModModerationRequest::query()
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
            Log::error('Error in ModModerationController@index', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load moderation requests'], 500);
        }
    }

    public function approve(Request $request, ModModerationRequest $moderationRequest): JsonResponse
    {
        try {
            DB::beginTransaction();

            $mod = Mode::create([
                'user_id' => $moderationRequest->user_id,
                'title' => $moderationRequest->title,
                'description' => $moderationRequest->description,
                'image' => $moderationRequest->image,
                'mod_file' => $moderationRequest->mod_file,
                'version' => $moderationRequest->version,
                'minecraft_version' => $moderationRequest->minecraft_version,
                'status' => 'active',
            ]);

            $moderationRequest->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'admin_comment' => $request->get('admin_comment'),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Мод одобрен и опубликован',
                'data' => ['mod_id' => $mod->id],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in ModModerationController@approve', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to approve mod'], 500);
        }
    }

    public function reject(Request $request, ModModerationRequest $moderationRequest): JsonResponse
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
                'message' => 'Мод отклонён',
                'data' => ['moderation_request_id' => $moderationRequest->id],
            ]);

        } catch (\Exception $e) {
            Log::error('Error in ModModerationController@reject', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to reject mod'], 500);
        }
    }

    public function show(ModModerationRequest $moderationRequest): JsonResponse
    {
        try {
            $moderationRequest->load(['user', 'reviewer']);
            return response()->json(['data' => $moderationRequest]);
        } catch (\Exception $e) {
            Log::error('Error in ModModerationController@show', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to load moderation request'], 500);
        }
    }
}
