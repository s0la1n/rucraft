<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mode;
use Illuminate\Http\JsonResponse;

class ModeController extends Controller
{
    public function index(): JsonResponse
    {
        $modes = Mode::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Mode $mode) {
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
            'data' => $modes,
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
                'images' => $mode->images->map(fn ($image) => $image->image_path)->values(),
                'file_url' => $mode->mod_file,
                'author' => [
                    'id' => $mode->user?->id,
                    'name' => $mode->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $mode->created_at?->toIso8601String(),
            ],
        ]);
    }
}

