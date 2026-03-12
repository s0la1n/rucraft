<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skin;
use App\Models\SkinModerationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SkinController extends Controller
{
    /**
     * Создать новую заявку на скин (для авторизованных пользователей)
     */
    public function store(Request $request): JsonResponse
    {
        Log::info('SkinController@store - начало', [
            'user_id' => $request->user()?->id,
            'has_file' => $request->hasFile('skin_file'),
            'all_input' => $request->all(),
            'files' => $request->files->all(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
        ]);

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'category' => 'required|in:Смешные,Для девочек,Для мальчиков,Аниме,Мобы,Милые,Ютуберы',
                'model' => 'required|in:Steve,Alex',
                'description' => 'nullable|string|max:1000',
                'skin_file' => 'required|file|mimes:png|max:20480', // 20MB
            ], [
                'title.required' => 'Название скина обязательно',
                'category.required' => 'Категория обязательна',
                'category.in' => 'Неверная категория',
                'model.required' => 'Модель обязательна',
                'model.in' => 'Неверная модель',
                'skin_file.required' => 'Файл скина обязателен',
                'skin_file.file' => 'Должен быть файл',
                'skin_file.mimes' => 'Файл должен быть в формате PNG',
                'skin_file.max' => 'Размер файла не должен превышать 20 МБ',
            ]);

            $user = $request->user();

            // Сохранение файла
            $file = $request->file('skin_file');
            $filename = uniqid() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('skins', $filename, 'public');

            if (!$path) {
                return response()->json([
                    'error' => 'Не удалось сохранить файл',
                ], 500);
            }

            // Создание заявки на модерацию
            $moderationRequest = SkinModerationRequest::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'skin_texture_file' => $path,
                'model' => $validated['model'],
                'category' => $validated['category'],
                'description' => $validated['description'] ?? null,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Скин отправлен на модерацию',
                'data' => [
                    'id' => $moderationRequest->id,
                    'title' => $moderationRequest->title,
                    'category' => $moderationRequest->category,
                    'status' => $moderationRequest->status,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Удаляем файл если валидация не прошла
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            return response()->json([
                'error' => 'Ошибка валидации',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Удаляем файл если произошла ошибка
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            Log::error('Error in SkinController@store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Не удалось создать заявку',
                'message' => $e->getMessage()
            ], 500);
        }
    }

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

                    // Возвращаем относительный путь вместо полного URL
                    $fileUrl = $filePath;

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
            // Возвращаем относительный путь вместо полного URL
            $fileUrl = $filePath;

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