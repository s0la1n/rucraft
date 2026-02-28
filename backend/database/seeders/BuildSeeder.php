<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Build;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BuildSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();  //автор - первый пользователь
    }
}
