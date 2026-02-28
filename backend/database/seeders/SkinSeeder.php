<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Skin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SkinSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();  //автор - первый пользователь

        $skins = [
            [
                'title' => 'Бобер пират',
                'skin_image' => 'Превью.png',
                'skin_file' => 'skins/Бобер_пират/бобер_пират1.png',
                'skin_texture_file' => 'skins/Бобер_пират/бобер_пират2.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'description' => 'Скин Бобёр пират для Майнкрафт, мальчик в новом формате 64x64 и модели Steve',
                'status' => 'active',
            ],
            [
                'title' => 'Великий каменьщик',
                'skin_image' => 'Превью.png',
                'skin_file' => 'skins/Великий_каменьщик/великий_каменьщик1.png',
                'skin_texture_file' => 'skins/Великий_каменьщик/великий_каменьщик2.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'description' => 'Скин великий каменьщик 0.2 для Майнкрафт, мальчик в новом формате 64x64 и модели Steve',
                'status' => 'active',
            ],
            [
                'title' => 'Король',
                'skin_image' => 'Превью.png',
                'skin_file' => 'skins/Король/король1.png',
                'skin_texture_file' => 'skins/Король/король2.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'description' => 'Скин Король для Майнкрафт, мальчик в новом формате 64x64 и модели Steve',
                'status' => 'active',
            ],
            [
                'title' => 'Рыцарь',
                'skin_image' => 'Превью.png',
                'skin_file' => 'skins/Рыцарь/рыцарь1.png',
                'skin_texture_file' => 'skins/Рыцарь/рыцарь2.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'description' => 'Скин Рыцарь для Майнкрафт, мальчик в новом формате 64x64 и модели Steve',
                'status' => 'active',
            ],
            [
                'title' => 'Телевизор',
                'skin_image' => 'Превью.png',
                'skin_file' => 'skins/Телевизор/телевизор1.png',
                'skin_texture_file' => 'skins/Телевизор/телевизор2.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'description' => 'Скин телевизор для Майнкрафт, мальчик в новом формате 64x64 и модели Steve',
                'status' => 'active',
            ],
        ];

        foreach ($skins as $skinData) {
            Skin::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'title' => $skinData['title'],
                ],
                array_merge($skinData, [
                    'user_id' => $user->id,
                ])
            );
        }
    }
}
