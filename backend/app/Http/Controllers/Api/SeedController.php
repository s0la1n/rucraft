<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seed;
use App\Models\SeedModerationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SeedController extends Controller
{
    /**
     * Создать новую заявку на сид (для авторизованных пользователей)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'seed_number' => 'required|string|max:255',
                'version' => 'required|in:java,bedrock,java_bedrock',
                'minecraft_release' => 'required|string|max:255',
                'description' => 'nullable|string|max:2000',
                'x' => 'nullable|numeric',
                'y' => 'nullable|numeric',
                'z' => 'nullable|numeric',
                'image_file' => 'required|file|mimes:png,jpg,jpeg|max:20480',
            ], [
                'title.required' => 'Название обязательно',
                'seed_number.required' => 'Число сида обязательно',
                'version.required' => 'Версия обязательна',
                'version.in' => 'Неверная версия (допустимы: java, bedrock, java_bedrock)',
                'minecraft_release.required' => 'Версия релиза Minecraft обязательна',
                'image_file.required' => 'Изображение обязательно',
                'image_file.mimes' => 'Изображение должно быть PNG, JPG или JPEG',
                'image_file.max' => 'Размер изображения не более 20 МБ',
            ]);

            $user = $request->user();

            // Сохранение изображения
            $imageFile = $request->file('image_file');
            $imageFilename = uniqid() . '_' . $imageFile->getClientOriginalName();
            $imagePath = $imageFile->storeAs('seeds', $imageFilename, 'public');

            // Формирование координат (для обратной совместимости)
            $coordinates = [
                'x' => (float) ($validated['x'] ?? 0),
                'y' => (float) ($validated['y'] ?? 0),
                'z' => (float) ($validated['z'] ?? 0),
            ];

            // Создание заявки на модерацию
            $moderationRequest = SeedModerationRequest::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'seed_number' => $validated['seed_number'],
                'version' => $validated['version'],
                'minecraft_release' => $validated['minecraft_release'],
                'description' => $validated['description'] ?? null,
                'coordinates' => $coordinates, // Это для модерации
                'image' => $imagePath,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Сид отправлен на модерацию',
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

            return response()->json([
                'error' => 'Ошибка валидации',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            if (isset($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            Log::error('Error in SeedController@store', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Не удалось создать заявку',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function index(): JsonResponse
    {
        $seeds = Seed::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Seed $seed) {
                return [
                    'id' => $seed->id,
                    'title' => $seed->title,
                    'seed' => $seed->seed_number,
                    'version' => $seed->version,
                    'release' => $seed->minecraft_release,
                    'image' => $seed->image,
                    'author' => [
                        'id' => $seed->user?->id,
                        'name' => $seed->user?->name ?? 'Неизвестный автор',
                    ],
                    'created_at' => $seed->created_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'data' => $seeds,
        ]);
    }

    public function show(Seed $seed): JsonResponse
    {
        $seed->load(['user', 'images']);

        // 🔥 ВАЖНО: Парсим координаты из JSON строки в массив
        $coordinates = [];
        if ($seed->coordinates) {
            // Проверяем, является ли строка JSON массивом
            $decoded = json_decode($seed->coordinates, true);
            if (is_array($decoded)) {
                // Проверяем, массив ли это объектов с именами
                if (isset($decoded[0]) && isset($decoded[0]['name'])) {
                    // Это уже массив координат с именами
                    $coordinates = $decoded;
                } else {
                    // Это одиночные координаты, преобразуем в массив с дефолтным именем
                    $coordinates = [[
                        'name' => 'Основная точка',
                        'x' => (float) ($decoded['x'] ?? 0),
                        'y' => (float) ($decoded['y'] ?? 0),
                        'z' => (float) ($decoded['z'] ?? 0),
                    ]];
                }
            }
        }

        return response()->json([
            'data' => [
                'id' => $seed->id,
                'title' => $seed->title,
                'seed' => $seed->seed_number,
                'version' => $seed->version,
                'release' => $seed->minecraft_release,
                // 🔥 Отправляем массив координат
                'coordinates' => $coordinates,
                // все изображения сида из таблицы seed_images
                'images' => $seed->images->pluck('image_path')->values(),
                // Для обратной совместимости оставляем x,y,z
                'x' => $coordinates[0]['x'] ?? 0,
                'y' => $coordinates[0]['y'] ?? 0,
                'z' => $coordinates[0]['z'] ?? 0,
                'author' => [
                    'id' => $seed->user?->id,
                    'name' => $seed->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $seed->created_at?->toIso8601String(),
            ],
        ]);
    }
}