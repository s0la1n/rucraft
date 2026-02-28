<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Seed;
use App\Models\SeedImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SeedSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();  //автор - первый пользователь

        $seeds = [
            [
                'title' => 'Деревня в спавне',
                'seed_number' => '123456789',
                'version' => 'java',
                'minecraft_release' => '1.20',
                'coordinates' => json_encode([
                    ['name' => 'Деревня', 'x' => 0, 'y' => 64, 'z' => 0],
                    ['name' => 'Храм в джунглях', 'x' => 450, 'y' => 70, 'z' => -220],
                ]),
                'image' => 'seeds/Деревня_в_спавне/Превью.jpg',
                'description' => 'Отличный сид для начала игры. Прямо на спавне находится большая деревня, а недалеко храм в джунглях.',
                'status' => 'active',
                'images' => [
                    'seeds/Деревня_в_спавне/Деревня_в_спавне1.jpg',
                    'seeds/Деревня_в_спавне/Деревня_в_спавне2.jpg',
                    'seeds/Деревня_в_спавне/Деревня_в_спавне3.jpg',
                ]
            ],
            [
                'title' => 'Остров грибов',
                'seed_number' => '-987654321',
                'version' => 'java',
                'minecraft_release' => '1.19',
                'coordinates' => json_encode([
                    ['name' => 'Грибной остров', 'x' => 120, 'y' => 63, 'z' => -350],
                ]),
                'image' => 'seeds/Остров_грибов/Превью.jpg',
                'description' => 'Редкий сид с грибным островом недалеко от точки спавна.',
                'status' => 'active',
                'images' => [
                    'seeds/Остров_грибов/Остров_грибов1.jpg',
                    'seeds/Остров_грибов/Остров_грибов2.jpg',
                    'seeds/Остров_грибов/Остров_грибов3.jpg',
                ]
            ],
        ];

        foreach ($seeds as $seedData) {
            // извлекаем дополнительные изображения из массива
            $images = $seedData['images'] ?? [];
            unset($seedData['images']);
            
            $seed = Seed::updateOrCreate(  // создаем или обновляем сид
                [
                    'user_id' => $user->id,
                    'title' => $seedData['title'],
                ],
                $seedData
            );
            
            foreach ($images as $index => $imagePath) { // добавляем дополнительные изображения
                SeedImage::updateOrCreate(
                    [
                        'seed_id' => $seed->id,
                        'image_path' => $imagePath,
                    ],
                    [
                        'sort_order' => $index + 1,
                    ]
                );
            }
        }
    }
}
