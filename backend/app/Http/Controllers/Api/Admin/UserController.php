<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->select('id', 'name', 'login', 'email', 'role', 'is_banned', 'created_at')
            ->orderBy('id')
            ->paginate($request->input('per_page', 15));

        return response()->json($users);
    }

    public function ban(Request $request, User $user): JsonResponse
    {
        $user->update(['is_banned' => true]);
        return response()->json(['message' => 'User banned', 'user' => $user->only('id', 'login', 'is_banned')]);
    }

    public function unban(User $user): JsonResponse
    {
        $user->update(['is_banned' => false]);
        return response()->json(['message' => 'User unbanned', 'user' => $user->only('id', 'login', 'is_banned')]);
    }
}
