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
                'skin_texture_file' => 'skins/bober_pirat.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Великий каменьщик',
                'skin_texture_file' => 'skins/kamenchik.png',
                'model' => 'Steve',
                'category' => 'Ютуберы',
                'status' => 'active',
            ],
            [
                'title' => 'Король',
                'skin_texture_file' => 'skins/king.png',
                'model' => 'Steve',
                'category' => 'Ютуберы',
                'status' => 'active',
            ],
            [
                'title' => 'Рыцарь',
                'skin_texture_file' => 'skins/ricar.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Телевизор',
                'skin_texture_file' => 'skins/tv.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Бабушка',
                'skin_texture_file' => 'skins/granny.png',
                'model' => 'Alex',
                'category' => 'Для девочек',
                'status' => 'active',
            ],
            [
                'title' => 'Беззубик',
                'skin_texture_file' => 'skins/bezzubik.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Бизнесмен стив',
                'skin_texture_file' => 'skins/bisnesmen.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Без фона',
                'skin_texture_file' => 'skins/no_fon.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Гастер',
                'skin_texture_file' => 'skins/gaster.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Зеленый гастер',
                'skin_texture_file' => 'skins/green_gaster.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Капибара',
                'skin_texture_file' => 'skins/capybara.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Крипер',
                'skin_texture_file' => 'skins/criper.png',
                'model' => 'Steve',
                'category' => 'Мобы',
                'status' => 'active',
            ],
            [
                'title' => 'Кулкид',
                'skin_texture_file' => 'skins/coolkid.png',
                'model' => 'Steve',
                'category' => 'Ютуберы',
                'status' => 'active',
            ],
            [
                'title' => 'Научный сотрудник',
                'skin_texture_file' => 'skins/scientist.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Повар',
                'skin_texture_file' => 'skins/kitchen.png',
                'model' => 'Steve',
                'category' => 'Милые',
                'status' => 'active',
            ],
            [
                'title' => 'Рыцарь энда',
                'skin_texture_file' => 'skins/ricar_end.png',
                'model' => 'Steve',
                'category' => 'Мобы',
                'status' => 'active',
            ],
            [
                'title' => 'Стив 67',
                'skin_texture_file' => 'skins/steve_67.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Ученая',
                'skin_texture_file' => 'skins/scince.png',
                'model' => 'Alex',
                'category' => 'Для девочек',
                'status' => 'active',
            ],
            [
                'title' => 'Эндермен',
                'skin_texture_file' => 'skins/endermen.png',
                'model' => 'Steve',
                'category' => 'Мобы',
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
