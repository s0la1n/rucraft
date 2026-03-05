<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 's0la1n',
                'login' => 's0la1n',
                'email' => 'liana.mannapova@bk.ru',
                'password' => Hash::make('123456'),
                'gender' => 'Женщина',
                'role' => 'admin',
                'is_banned' => false,
            ],
            [
                'name' => 'mikamikisser',
                'login' => 'mikamikisser',
                'email' => 'nailanatfullina@gmail.com',
                'gender' => 'Женщина',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'is_banned' => false,
            ],
            [
                'name' => 'memesori',
                'login' => 'memesori',
                'email' => 'nastya.davydova.2006@mail.ru',
                'gender' => 'Женщина',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'is_banned' => false,
            ],
            [
                'name' => 'zushon',
                'login' => 'zushon',
                'email' => 'Regina15may2006@gmail.com',
                'gender' => 'Женщина',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'is_banned' => false,
            ],
            [
                'name' => 'levlafan1',
                'login' => 'levlafan1',
                'email' => 'nurutdinovas63@gmail.com',
                'gender' => 'Женщина',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'is_banned' => false,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                [
                    'login' => $userData['login'],  //искать пользователя только по логину, а остальные поля обновлять
                ],
                $userData
            );
        }
    }
}
