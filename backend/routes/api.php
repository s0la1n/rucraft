<?php

use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
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
Route::get('/builds/difficulties', [BuildController::class, 'difficulties']);
Route::post('/builds', [BuildController::class, 'store'])->middleware('auth:sanctum');

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

Route::get('/skins', [SkinController::class, 'index']);
Route::get('/skins/{skin}/download', [SkinController::class, 'downloadTexture']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn (Request $request) => response()->json(['user' => $request->user()->only('id', 'name', 'login', 'email', 'role')]));
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users/{user}/ban', [AdminUserController::class, 'ban']);
        Route::post('/users/{user}/unban', [AdminUserController::class, 'unban']);
    });
});
