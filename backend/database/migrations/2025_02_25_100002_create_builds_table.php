<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('builds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('image');
            $table->string('video_file')->nullable();
            $table->text('description')->nullable();
            $table->enum('difficulty', ['легкая', 'обычная', 'сложная'])->default('обычная');
            $table->json('materials')->nullable(); // список материалов для постройки
            $table->enum('status', ['process', 'active', 'inactive'])->default('process');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('builds');
    }
};
