<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seeds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('seed_number');
            $table->enum('version', ['java', 'bedrock', 'java_bedrock'])->default('java');
            $table->string('minecraft_release')->nullable();
            $table->json('coordinates')->nullable(); // координаты в формате json, напр. [{"x": 100, "y": 64, "z": -200}, ...]
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['process', 'active', 'inactive'])->default('process');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seeds');
    }
};
