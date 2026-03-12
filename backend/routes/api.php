<?php

use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\DeveloperController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\BuildController;
use App\Http\Controllers\Api\ModeController;
use App\Http\Controllers\Api\SeedController;
use App\Http\Controllers\Api\SkinController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'ok' => true,
        'message' => 'Backend connected',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/developers', [DeveloperController::class, 'index']);

// Публичные списки и страницы с подробной информацией
Route::get('/builds', [BuildController::class, 'index']);
Route::get('/builds/{build}', [BuildController::class, 'show']);
Route::get('/builds/{build}/download', [BuildController::class, 'downloadFile']);

Route::prefix('mods')->group(function () {
    Route::get('/', [ModeController::class, 'index']);
    Route::post('/', [ModeController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/versions', [ModeController::class, 'versions']);
    Route::get('/minecraft-versions', [ModeController::class, 'minecraftVersions']);
    Route::get('/{mode}', [ModeController::class, 'show']);
    Route::get('/{mode}/download', [ModeController::class, 'downloadFile'])->name('mods.download');
});

Route::get('/seeds', [SeedController::class, 'index']);
Route::get('/seeds/{seed}', [SeedController::class, 'show']);

// Маршруты для скинов
Route::get('/skins', [SkinController::class, 'index']);
Route::get('/skins/{skin}', [SkinController::class, 'show']); // Для просмотра одного скина
Route::get('/skins/{skin}/download', [SkinController::class, 'downloadTexture']);
Route::get('/skins/{skin}/file', [SkinController::class, 'getSkinFile']); // Для прямого просмотра

// Аутентификация
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Защищенные маршруты
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn (Request $request) => response()->json(['user' => $request->user()->only('id', 'name', 'login', 'email', 'role')]));
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Админские маршруты
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users/{user}/ban', [AdminUserController::class, 'ban']);
        Route::post('/users/{user}/unban', [AdminUserController::class, 'unban']);
        Route::get('/analytics', [AnalyticsController::class, 'index']);
    });
});

Route::get('/debug-skins-full', function() {
    $results = [
        'app_url' => env('APP_URL'),
        'storage_path_public' => storage_path('app/public'),
        'public_storage' => public_path('storage'),
        'public_storage_exists' => file_exists(public_path('storage')),
        'public_storage_is_link' => is_link(public_path('storage')),
    ];
    
    // Проверяем файлы скинов
    $skinDir = storage_path('app/public/skins');
    if (is_dir($skinDir)) {
        $files = scandir($skinDir);
        $skinFiles = [];
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $fullPath = $skinDir . '/' . $file;
                $skinFiles[] = [
                    'name' => $file,
                    'size' => filesize($fullPath),
                    'url' => url('storage/skins/' . $file),
                    'exists_in_storage' => Storage::disk('public')->exists('skins/' . $file),
                ];
            }
        }
        $results['skin_files'] = $skinFiles;
    } else {
        $results['skin_files'] = 'Directory not found';
    }
    
    // Проверяем первый скин из БД
    $firstSkin = App\Models\Skin::first();
    if ($firstSkin) {
        $results['first_skin'] = [
            'id' => $firstSkin->id,
            'title' => $firstSkin->title,
            'file_path' => $firstSkin->skin_texture_file,
            'full_path' => storage_path('app/public/' . $firstSkin->skin_texture_file),
            'file_exists' => file_exists(storage_path('app/public/' . $firstSkin->skin_texture_file)),
            'storage_exists' => Storage::disk('public')->exists($firstSkin->skin_texture_file),
            'url' => $firstSkin->skin_texture_file ? url('storage/' . $firstSkin->skin_texture_file) : null,
        ];
    }
    
    return response()->json($results);
});