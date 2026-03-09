<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skin;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

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
                    'file_url' => $skin->skin_texture_file,
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

    public function downloadTexture(Skin $skin)
    {
        $path = $skin->skin_texture_file;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404);
        }

        $filename = basename($path);

        return Storage::disk('public')->download($path, $filename);
    }
}

