<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ModeController extends Controller
{
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