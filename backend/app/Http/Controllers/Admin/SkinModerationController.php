<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Skin;
use App\Models\SkinModerationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SkinModerationController extends Controller
{
    /**
     * Получить все заявки на модерацию
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 12);
            $status = $request->get('status');

            $query = SkinModerationRequest::query()
                ->with(['user', 'reviewer'])
                ->orderByDesc('created_at');

            // Фильтр по статусу
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
            Log::error('Error in SkinModerationController@index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to load moderation requests',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Одобрить скин
     */
    public function approve(Request $request, SkinModerationRequest $moderationRequest): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Создать активный скин из заявки
            $skin = Skin::create([
                'user_id' => $moderationRequest->user_id,
                'title' => $moderationRequest->title,
                'skin_texture_file' => $moderationRequest->skin_texture_file,
                'model' => $moderationRequest->model,
                'category' => $moderationRequest->category,
                'description' => $moderationRequest->description,
                'status' => 'active',
            ]);

            // Обновить статус заявки
            $moderationRequest->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'admin_comment' => $request->get('admin_comment'),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Скин одобрен и опубликован',
                'data' => [
                    'skin_id' => $skin->id,
                    'moderation_request_id' => $moderationRequest->id,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error in SkinModerationController@approve', [
                'moderation_request_id' => $moderationRequest->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to approve skin',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Отклонить скин
     */
    public function reject(Request $request, SkinModerationRequest $moderationRequest): JsonResponse
    {
        try {
            $reason = $request->get('admin_comment');

            if (!$reason || trim($reason) === '') {
                return response()->json([
                    'error' => 'Укажите причину отклонения',
                ], 422);
            }

            // Обновить статус заявки (файл НЕ удаляем - он может понадобиться для просмотра)
            $moderationRequest->update([
                'status' => 'rejected',
                'reviewed_by' => $request->user()->id,
                'admin_comment' => $reason,
            ]);

            return response()->json([
                'message' => 'Скин отклонён',
                'data' => [
                    'moderation_request_id' => $moderationRequest->id,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error in SkinModerationController@reject', [
                'moderation_request_id' => $moderationRequest->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to reject skin',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить детальную информацию о заявке
     */
    public function show(SkinModerationRequest $moderationRequest): JsonResponse
    {
        try {
            $moderationRequest->load(['user', 'reviewer']);

            return response()->json([
                'data' => $moderationRequest,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in SkinModerationController@show', [
                'moderation_request_id' => $moderationRequest->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to load moderation request'
            ], 500);
        }
    }
}
