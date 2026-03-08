<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skin;
use Illuminate\Http\JsonResponse;

class SkinController extends Controller
{
    public function index(): JsonResponse
    {
        $skins = Skin::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Skin $skin) {
                return [
                    'id' => $skin->id,
                    'title' => $skin->title,
                    'category' => $skin->category,
                    'image' => $skin->skin_image,
                    'author' => [
                        'id' => $skin->user?->id,
                        'name' => $skin->user?->name ?? 'Неизвестный автор',
                    ],
                    'created_at' => $skin->created_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'data' => $skins,
        ]);
    }

    public function show(Skin $skin): JsonResponse
    {
        $skin->load(['user']);

        return response()->json([
            'data' => [
                'id' => $skin->id,
                'title' => $skin->title,
                'category' => $skin->category,
                'image_url' => $skin->skin_image,
                'file_url' => $skin->skin_file ?? $skin->skin_texture_file,
                'author' => [
                    'id' => $skin->user?->id,
                    'name' => $skin->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $skin->created_at?->toIso8601String(),
            ],
        ]);
    }
}

