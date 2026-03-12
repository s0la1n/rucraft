<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Build;
use App\Models\BuildImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BuildController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Build::query()
            ->with('user')
            ->orderByDesc('created_at');
        
        if ($request->has('difficulty') && !empty($request->difficulty)) {
            $query->where('difficulty', $request->difficulty);
        }
        
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        $perPage = $request->get('per_page', 12);
        $builds = $query->paginate($perPage);
        
        $data = $builds->map(function (Build $build) {
            return [
                'id' => $build->id,
                'title' => $build->title,
                'description' => $build->description,
                'image' => $build->image,
                'minecraft_version' => $build->minecraft_version,
                'difficulty' => $build->difficulty,
                'author' => [
                    'id' => $build->user?->id,
                    'name' => $build->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $build->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $data,
            'current_page' => $builds->currentPage(),
            'last_page' => $builds->lastPage(),
            'per_page' => $builds->perPage(),
            'total' => $builds->total(),
        ]);
    }

    public function difficulties(): JsonResponse
    {
        $difficulties = Build::query()
            ->whereNotNull('difficulty')
            ->distinct()
            ->pluck('difficulty')
            ->values();

        return response()->json([
            'data' => $difficulties
        ]);
    }

    public function show(Build $build): JsonResponse
    {
        $build->load(['user', 'images']);

        $materials = is_string($build->materials) 
            ? json_decode($build->materials, true) 
            : ($build->materials ?? []);

        return response()->json([
            'data' => [
                'id' => $build->id,
                'title' => $build->title,
                'description' => $build->description,
                'images' => $build->images->map(fn ($image) => $image->image_path)->values(),
                'blocks' => collect($materials)->map(function ($item) {
                    return [
                        'name' => $item['name'] ?? '',
                        'count' => (int) ($item['count'] ?? 0),
                    ];
                })->values(),
                'file_url' => $build->build_file,
                'author' => [
                    'id' => $build->user?->id,
                    'name' => $build->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $build->created_at?->toIso8601String(),
                'minecraft_version' => $build->minecraft_version,
                'difficulty' => $build->difficulty,
            ],
        ]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'minecraft_version' => 'nullable|string|max:50',
            'difficulty' => 'required|string|max:50',
            'build_file' => 'required|file|max:51200',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
            'materials' => 'nullable|json',
        ]);

        $build = new Build();
        $build->title = $request->title;
        $build->description = $request->description;
        $build->minecraft_version = $request->minecraft_version;
        $build->difficulty = $request->difficulty;
        $build->user_id = auth()->id();
        $build->status = 'active';
        
        // ВРЕМЕННОЕ ЗНАЧЕНИЕ для image (потом заменится на первое изображение)
        $build->image = 'temp-placeholder.jpg';

        // Сохраняем материалы из JSON
        if ($request->has('materials')) {
            $build->materials = json_decode($request->materials, true);
        } else {
            $build->materials = [];
        }

        if ($request->hasFile('build_file')) {
            $path = $request->file('build_file')->store('builds', 'public');
            $build->build_file = $path;
        }

        $build->save();

        // Обрабатываем изображения
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('builds', 'public');
                
                // Если это первое изображение - обновляем поле image
                if ($index === 0) {
                    $build->image = $path;
                    $build->save();
                }
                
                // Сохраняем в таблицу images
                $build->images()->create([
                    'image_path' => $path,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'message' => 'Постройка успешно добавлена',
            'data' => [
                'id' => $build->id,
                'title' => $build->title,
                'images_count' => $build->images()->count(),
            ]
        ], 201);
    }

    public function downloadFile(Build $build)
    {
        $path = $build->build_file;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $filename = basename($path);

        return Storage::disk('public')->download($path, $filename);
    }
}