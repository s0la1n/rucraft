<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Skin;
use App\Models\User;
use App\Models\Build;
use App\Models\Mode;
use App\Models\Seed;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        // Общая статистика
        $totalUsers = User::count();
        $bannedUsers = User::where('is_banned', true)->count();
        $totalSkins = Skin::count();
        $totalBuilds = Build::count();
        $totalModes = Mode::count();
        $totalSeeds = Seed::count();

        // Статистика по категориям скинов
        $skinsByCategory = Skin::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->map(fn($item) => [
                'name' => $item->category,
                'value' => $item->count,
            ]);

        // Статистика по статусам скинов
        $skinsByStatus = Skin::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'name' => $item->status,
                'value' => $item->count,
            ]);

        // Пользователи по ролям
        $usersByRole = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->get()
            ->map(fn($item) => [
                'name' => $item->role,
                'value' => $item->count,
            ]);

        // Новые пользователи по месяцам (за последние 12 месяцев)
        $newUsersByMonth = User::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'count' => $item->count,
            ]);

        // Контент по типам
        $contentByType = collect([
            ['name' => 'Скины', 'value' => $totalSkins],
            ['name' => 'Постройки', 'value' => $totalBuilds],
            ['name' => 'Моды', 'value' => $totalModes],
            ['name' => 'Сиды', 'value' => $totalSeeds],
        ]);

        return response()->json([
            'summary' => [
                'total_users' => $totalUsers,
                'banned_users' => $bannedUsers,
                'active_users' => $totalUsers - $bannedUsers,
                'total_skins' => $totalSkins,
                'total_builds' => $totalBuilds,
                'total_modes' => $totalModes,
                'total_seeds' => $totalSeeds,
            ],
            'skins_by_category' => $skinsByCategory,
            'skins_by_status' => $skinsByStatus,
            'users_by_role' => $usersByRole,
            'new_users_by_month' => $newUsersByMonth,
            'content_by_type' => $contentByType,
        ]);
    }
}
