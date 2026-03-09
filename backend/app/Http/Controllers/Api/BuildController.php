<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Build;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BuildController extends Controller
{
    public function index(): JsonResponse
    {
        $builds = Build::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Build $build) {
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
            'data' => $builds,
        ]);
    }

    public function show(Build $build): JsonResponse
    {
        $build->load(['user', 'images']);

        return response()->json([
            'data' => [
                'id' => $build->id,
                'title' => $build->title,
                'description' => $build->description,
                'images' => $build->images->map(fn ($image) => $image->image_path)->values(),
                'blocks' => collect($build->materials ?? [])->map(function ($item) {
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
            ],
        ]);
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

