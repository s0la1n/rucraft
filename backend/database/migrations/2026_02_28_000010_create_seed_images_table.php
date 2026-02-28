<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seed_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seed_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->unsignedInteger('sort_order')->default(1);  //целые неотрицательные числа  //порядок отображения
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seed_images');
    }
};

