<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seed;
use Illuminate\Http\JsonResponse;

class SeedController extends Controller
{
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

        $coordinates = $seed->coordinates ?? [];

        return response()->json([
            'data' => [
                'id' => $seed->id,
                'title' => $seed->title,
                'seed' => $seed->seed_number,
                'version' => $seed->version,
                'release' => $seed->minecraft_release,
                'x' => (float) ($coordinates['x'] ?? 0),
                'y' => (float) ($coordinates['y'] ?? 0),
                'z' => (float) ($coordinates['z'] ?? 0),
                'author' => [
                    'id' => $seed->user?->id,
                    'name' => $seed->user?->name ?? 'Неизвестный автор',
                ],
                'created_at' => $seed->created_at?->toIso8601String(),
            ],
        ]);
    }
}

