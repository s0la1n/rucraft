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

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'version' => 'required|string|max:50',
            'minecraft_version' => 'nullable|string|max:50',
            'mod_file' => 'required|file|mimes:jar,zip|max:51200',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120', // каждое изображение до 5МБ
        ]);

        $mod = new Mode();
        $mod->title = $request->title;
        $mod->description = $request->description;
        $mod->version = $request->version;
        $mod->minecraft_version = $request->minecraft_version;
        $mod->user_id = auth()->id();
        $mod->status = 'active';

        if ($request->hasFile('mod_file')) {
            $path = $request->file('mod_file')->store('mods', 'public');
            $mod->mod_file = $path;
        }

        $mod->save();

        // Сохраняем все изображения
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('mods', 'public');
                
                // Первое изображение сохраняем как превью в поле image
                if ($index === 0) {
                    $mod->image = $path;
                    $mod->save();
                }
                
                // Все изображения сохраняем в mode_images
                $mod->images()->create([
                    'image_path' => $path,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'message' => 'Мод успешно добавлен',
            'data' => [
                'id' => $mod->id,
                'title' => $mod->title,
                'images_count' => $mod->images()->count(),
            ]
        ], 201);
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