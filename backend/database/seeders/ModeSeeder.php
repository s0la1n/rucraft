<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Mode;
use App\Models\ModeImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModeSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();  //автор - первый пользователь

        $mods = [
            [
                'title' => 'Покрытые зельями',
                'description' => 'Данный мод позволит применять эффекты зелий к оружию, инструментам и броне. Эти эффекты срабатывают при атаке для оружия, получении урона для брони и разрушении блока для инструментов.',
                'mod_file' => 'itemcoating-forge-2.0.0.jar',
                'version' => 'java',
                'minecraft_version' => '1.20.1',
                'image' => 'mods/Покрытые_зельями/Превью.png',
                'status' => 'active',
                'images' => [
                    'mods/Покрытые_зельями/Покрытые_зельями1.png',
                ],
            ],
            [
                'title' => 'Зомби строят и ломают',
                'description' => 'Сделает зомби опаснее, наделяя их способностью ломать и ставить блоки. Кроме базового поведения, для усложнения можно включить возможность видеть цели сквозь стены или всегда видеть ближайшего игрока. Это поведение можно включить не только для зомби, но и других монстров.',
                'mod_file' => 'ZombiesBreakBuild-forge-1.21.11-1.4.1.jar',
                'version' => 'java',
                'minecraft_version' => '1.21.11',
                'image' => 'mods/Зомби_строят_и_ломают/Превью.jpg',
                'status' => 'active',
                'images' => [
                    'mods/Зомби_строят_и_ломают/Зомби_строят_и_ломают1.jpg',
                    'mods/Зомби_строят_и_ломают/Зомби_строят_и_ломают2.jpg',
                    'mods/Зомби_строят_и_ломают/Зомби_строят_и_ломают1.gif',
                ],
            ],
            [
                'title' => 'Снежный биом - улучшение',
                'description' => 'Модификация старается сделать холодные биомы более оживлёнными и интересными за счёт добавления новых животных. На данный момент это арктическая треска и гренландские тюлени. Кроме мобов, в игре появится также ящик — хранилище, вмещающее в себя большое количество единиц одного предмета и декоративный снежный шар.',
                'mod_file' => 'bountifulseals-1.0.1-1.21.1.jar',
                'version' => 'java',
                'minecraft_version' => '1.21.1',
                'image' => 'mods/Снежный_биом/Превью.png',
                'status' => 'active',
                'images' => [
                    'mods/Снежный_биом/cнежный_биом1.png',
                    'mods/Снежный_биом/cнежный_биом2.png',
                    'mods/Снежный_биом/cнежный_биом3.png',
                ],
            ],
            [
                'title' => 'OptiFine',
                'description' => 'Мод для оптимизации графики и производительности, добавляет поддержку шейдеров.',
                'mod_file' => 'OptiFine_1.20.1.jar',
                'version' => 'java',
                'minecraft_version' => '1.20.1',
                'image' => 'mods/Optifine/Превью.jpg',
                'status' => 'active',
                'images' => [
                    'mods/Optifine/Optifine1.png',
                ],
            ],
            [
                'title' => 'Biomes O\' Plenty',
                'description' => 'Добавляет в игру множество новых биомов, растений и блоков.',
                'mod_file' => 'BiomesOPlenty-1.20.1.jar',
                'version' => 'java',
                'minecraft_version' => '1.20.1',
                'image' => 'mods/BOP/Превью.png',
                'status' => 'process',
                'images' => [
                    'mods/BOP/bop1.png',
                    'mods/BOP/bop2.png',
                ],
            ],
        ];

        foreach ($mods as $modData) {
            $images = $modData['images'] ?? [];
            unset($modData['images']);

            $mode = Mode::updateOrCreate(
                [ // условия поиска
                    'user_id' => $user->id,
                    'title' => $modData['title'],
                ],
                array_merge($modData, [  //слияние массивов в один
                    'user_id' => $user->id,
                ])
            );

            foreach ($images as $index => $imagePath) {
                ModeImage::updateOrCreate(
                    [ // условия поиска
                        'mode_id' => $mode->id,
                        'image_path' => $imagePath,
                    ],
                    [
                        'sort_order' => $index + 1, // порядковый номер
                    ]
                );
            }
        }
    }
}
