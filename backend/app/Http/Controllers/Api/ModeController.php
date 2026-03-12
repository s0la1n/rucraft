<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mode;
use App\Models\ModModerationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ModeController extends Controller
{
    /**
     * Создать новую заявку на мод (для авторизованных пользователей)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:2000',
                'version' => 'required|in:java,bedrock,java_bedrock',
                'minecraft_version' => 'required|string|max:255',
                'image_file' => 'required|file|mimes:png,jpg,jpeg|max:20480',
                'mod_file' => 'required|file|max:102400', // 100MB
            ], [
                'title.required' => 'Название обязательно',
                'version.required' => 'Версия обязательна',
                'version.in' => 'Неверная версия (допустимы: java, bedrock, java_bedrock)',
                'minecraft_version.required' => 'Версия Minecraft обязательна',
                'image_file.required' => 'Изображение обязательно',
                'image_file.mimes' => 'Изображение должно быть PNG, JPG или JPEG',
                'image_file.max' => 'Размер изображения не более 20 МБ',
                'mod_file.required' => 'Файл мода обязателен',
                'mod_file.max' => 'Размер файла мода не более 100 МБ',
            ]);

            $user = $request->user();

            // Сохранение изображения
            $imageFile = $request->file('image_file');
            $imageFilename = uniqid() . '_' . $imageFile->getClientOriginalName();
            $imagePath = $imageFile->storeAs('mods', $imageFilename, 'public');

            // Сохранение файла мода
            $modFile = $request->file('mod_file');
            $modFilename = uniqid() . '_' . $modFile->getClientOriginalName();
            $modFilePath = $modFile->storeAs('mods', $modFilename, 'public');

            // Создание заявки на модерацию
            $moderationRequest = ModModerationRequest::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'image' => $imagePath,
                'mod_file' => $modFilePath,
                'version' => $validated['version'],
                'minecraft_version' => $validated['minecraft_version'],
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Мод отправлен на модерацию',
                'data' => [
                    'id' => $moderationRequest->id,
                    'title' => $moderationRequest->title,
                    'status' => $moderationRequest->status,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            if (isset($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            if (isset($modFilePath)) {
                Storage::disk('public')->delete($modFilePath);
            }

            return response()->json([
                'error' => 'Ошибка валидации',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            if (isset($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            if (isset($modFilePath)) {
                Storage::disk('public')->delete($modFilePath);
            }

            Log::error('Error in ModeController@store', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Не удалось создать заявку',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Mode::query()
            ->with('user')
            ->orderByDesc('created_at');
        
        if ($request->has('version') && !empty($request->version)) {
            $query->where('version', $request->version);
        }
        
        if ($request->has('minecraft_version') && !empty($request->minecraft_version)) {
            $query->where('minecraft_version', $request->minecraft_version);
        }
        
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        $perPage = $request->get('per_page', 12);
        $modes = $query->paginate($perPage);
        
        $data = $modes->map(function (Mode $mode) {
            return [
                'id' => $mode->id,
                'title' => $mode->title,
                'description' => $mode->description,
                'image' => $mode->image,
                'minecraft_version' => $mode->minecraft_version,
                'version' => $mode->version,
                'author' => [
                    'id' => $mode->user?->id,
                    'name' => $mode->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $mode->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $data,
            'current_page' => $modes->currentPage(),
            'last_page' => $modes->lastPage(),
            'per_page' => $modes->perPage(),
            'total' => $modes->total(),
        ]);
    }

    public function versions(): JsonResponse
    {
        $versions = Mode::query()
            ->whereNotNull('version')
            ->distinct()
            ->pluck('version')
            ->values();

        return response()->json([
            'data' => $versions
        ]);
    }

    public function minecraftVersions(): JsonResponse
    {
        $versions = Mode::query()
            ->whereNotNull('minecraft_version')
            ->distinct()
            ->pluck('minecraft_version')
            ->values();

        return response()->json([
            'data' => $versions
        ]);
    }

    public function show(Mode $mode): JsonResponse
    {
        $mode->load(['user', 'images']);

        return response()->json([
            'data' => [
                'id' => $mode->id,
                'title' => $mode->title,
                'description' => $mode->description,
                'images' => $mode->images->pluck('image_path')->values(),
                'file_url' => $mode->mod_file,
                'minecraft_version' => $mode->minecraft_version,
                'version' => $mode->version,
                'author' => [
                    'id' => $mode->user?->id,
                    'name' => $mode->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $mode->created_at?->toIso8601String(),
            ],
        ]);
    }

    public function downloadFile(Mode $mode)
    {
        $path = $mode->mod_file;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $filename = basename($path);

        return Storage::disk('public')->download($path, $filename);
    }
}