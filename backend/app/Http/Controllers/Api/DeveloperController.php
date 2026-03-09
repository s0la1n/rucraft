<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Developer;
use Illuminate\Http\JsonResponse;

class DeveloperController extends Controller
{
    public function index(): JsonResponse
    {
        $developers = Developer::query()
            ->orderBy('name')
            ->get()
            ->map(function (Developer $developer) {
                $skin = $developer->skin ? basename($developer->skin) : null;

                return [
                    'id' => $developer->id,
                    'name' => $developer->name,
                    'role' => $developer->role,
                    'bio' => $developer->bio,
                    'telegram' => $developer->telegram,
                    'vk' => $developer->vk,
                    'skin_url' => $skin
                        ? asset('storage/developers/' . $skin)
                        : null,
                ];
            });

        return response()->json([
            'data' => $developers,
        ]);
    }
}

