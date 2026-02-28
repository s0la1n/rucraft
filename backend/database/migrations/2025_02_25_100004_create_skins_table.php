<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('skin_image');
            $table->string('skin_file');
            $table->string('skin_texture_file');
            $table->enum('model', ['Steve', 'Alex']);
            $table->enum('category', ['Смешные', 'Для девочек', 'Для мальчиков', 'Аниме']);
            $table->text('description')->nullable();
            $table->enum('status', ['process', 'active', 'inactive'])->default('process');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skins');
    }
};
