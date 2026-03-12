<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skin;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SkinController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            // Используем paginate() вместо get() для пагинации
            $perPage = request()->get('per_page', 12); // 12 скинов на страницу по умолчанию
            $category = request()->get('category');
            
            $query = Skin::query()
                ->with('user')
                ->where('status', 'active');
            
            // Фильтр по категории
            if ($category && $category !== '') {
                $query->where('category', $category);
            }
            
            $skins = $query->orderByDesc('created_at')
                ->paginate($perPage)
                ->through(function (Skin $skin) {
                    $filePath = $skin->skin_texture_file;
                    
                    // Формируем URL
                    $fileUrl = null;
                    
                    if ($filePath) {
                        // Проверяем существование файла
                        if (Storage::disk('public')->exists($filePath)) {
                            $fileUrl = url('storage/' . $filePath);
                        } else {
                            // Если файл не найден, используем заглушку
                            $fileUrl = 'https://via.placeholder.com/64x64/1e3c72/ffffff?text=' . urlencode($skin->title);
                            
                            Log::warning('Skin file not found', [
                                'skin_id' => $skin->id,
                                'path' => $filePath
                            ]);
                        }
                    }

                    return [
                        'id' => $skin->id,
                        'title' => $skin->title,
                        'category' => $skin->category,
                        'model' => $skin->model,
                        'status' => $skin->status,
                        'file_url' => $fileUrl,
                        'author' => [
                            'id' => $skin->user?->id,
                            'name' => $skin->user?->name ?? 'Неизвестный автор',
                        ],
                        'created_at' => $skin->created_at?->toIso8601String(),
                    ];
                });

            return response()->json([
                'data' => $skins->items(),
                'current_page' => $skins->currentPage(),
                'last_page' => $skins->lastPage(),
                'per_page' => $skins->perPage(),
                'total' => $skins->total(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error in SkinController@index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to load skins',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTexture(Skin $skin)
    {
        try {
            $path = $skin->skin_texture_file;
            
            if (!$path) {
                return response()->json(['error' => 'No file path'], 404);
            }
            
            // Полный путь к файлу
            $fullPath = storage_path('app/public/' . $path);
            
            Log::info('Download attempt', [
                'skin_id' => $skin->id,
                'title' => $skin->title,
                'path' => $path,
                'full_path' => $fullPath,
                'exists' => file_exists($fullPath)
            ]);
            
            if (!file_exists($fullPath)) {
                return response()->json([
                    'error' => 'File not found',
                    'path' => $path,
                    'full_path' => $fullPath
                ], 404);
            }
            
            // Очищаем имя файла от недопустимых символов
            $filename = $skin->title . '.png';
            $filename = preg_replace('/[^a-zA-Z0-9а-яА-Я_\-\.]/u', '_', $filename);
            
            return response()->download($fullPath, $filename, [
                'Content-Type' => 'image/png',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Download error', [
                'skin_id' => $skin->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'error' => 'Download failed: ' . $e->getMessage()
            ], 500);
        }
    }

    // Добавляем метод для получения одного скина
    public function show(Skin $skin)
    {
        try {
            $skin->load('user');
            
            $filePath = $skin->skin_texture_file;
            $fileUrl = null;
            
            if ($filePath) {
                if (Storage::disk('public')->exists($filePath)) {
                    $fileUrl = url('storage/' . $filePath);
                }
            }

            return response()->json([
                'data' => [
                    'id' => $skin->id,
                    'title' => $skin->title,
                    'category' => $skin->category,
                    'model' => $skin->model,
                    'status' => $skin->status,
                    'file_url' => $fileUrl,
                    'author' => [
                        'id' => $skin->user?->id,
                        'name' => $skin->user?->name ?? 'Неизвестный автор',
                    ],
                    'created_at' => $skin->created_at?->toIso8601String(),
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in SkinController@show', [
                'skin_id' => $skin->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'error' => 'Failed to load skin'
            ], 500);
        }
    }
}