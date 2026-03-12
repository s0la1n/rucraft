<?php

use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/skin-image/{filename}', function ($filename) {
    $decodedFilename = urldecode($filename);
    $path = storage_path('app/public/skins/' . $decodedFilename);

    if (!file_exists($path)) {
        return response()->json(['error' => 'File not found', 'path' => $path, 'filename' => $decodedFilename], 404);
    }

    return response()->file($path, [
        'Content-Type' => 'image/png',
        'Access-Control-Allow-Origin' => 'http://localhost:3000',
        'Access-Control-Allow-Credentials' => 'true',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type',
    ]);
})->where('filename', '.*');

// Универсальный маршрут для изображений контента
Route::get('/content-image/{type}/{filename}', function ($type, $filename) {
    $decodedFilename = urldecode($filename);
    
    // Разрешённые типы и их директории
    $allowedTypes = [
        'skins' => 'skins',
        'builds' => 'builds',
        'mods' => 'mods',
        'seeds' => 'seeds',
    ];
    
    if (!isset($allowedTypes[$type])) {
        return response()->json(['error' => 'Invalid type'], 400);
    }
    
    $path = storage_path('app/public/' . $allowedTypes[$type] . '/' . $decodedFilename);

    if (!file_exists($path)) {
        return response()->json(['error' => 'File not found', 'path' => $path, 'filename' => $decodedFilename], 404);
    }

    $contentType = pathinfo($path, PATHINFO_EXTENSION) === 'png' ? 'image/png' : 'image/jpeg';

    return response()->file($path, [
        'Content-Type' => $contentType,
        'Access-Control-Allow-Origin' => 'http://localhost:3000',
        'Access-Control-Allow-Credentials' => 'true',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type',
    ]);
})->where(['type' => '[a-z]+', 'filename' => '.*']);

// Тест "Вы как мы"
Route::get('/quiz', [QuizController::class, 'show'])->name('quiz.show');
Route::post('/quiz/submit', [QuizController::class, 'submit'])->name('quiz.submit');
