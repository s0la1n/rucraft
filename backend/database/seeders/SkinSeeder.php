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
                'skin_texture_file' => 'skins/бобер_пират.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Великий каменьщик',
                'skin_texture_file' => 'skins/великий_каменьщик.png',
                'model' => 'Steve',
                'category' => 'Ютуберы',
                'status' => 'active',
            ],
            [
                'title' => 'Король',
                'skin_texture_file' => 'skins/король.png',
                'model' => 'Steve',
                'category' => 'Ютуберы',
                'status' => 'active',
            ],
            [
                'title' => 'Рыцарь',
                'skin_texture_file' => 'skins/рыцарь.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Телевизор',
                'skin_texture_file' => 'skins/телевизор.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Бабушка',
                'skin_texture_file' => 'skins/бабушка.png',
                'model' => 'Alex',
                'category' => 'Для девочек',
                'status' => 'active',
            ],
            [
                'title' => 'Беззубик',
                'skin_texture_file' => 'skins/беззубик.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Бизнесмен стив',
                'skin_texture_file' => 'skins/бизнесмен_стив.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Без фона',
                'skin_texture_file' => 'skins/без_фона.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Гастер',
                'skin_texture_file' => 'skins/гастер.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Зеленый гастер',
                'skin_texture_file' => 'skins/зеленый_гастер.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Капибара',
                'skin_texture_file' => 'skins/капибара.png',
                'model' => 'Steve',
                'category' => 'Смешные',
                'status' => 'active',
            ],
            [
                'title' => 'Крипер',
                'skin_texture_file' => 'skins/крипер.png',
                'model' => 'Steve',
                'category' => 'Мобы',
                'status' => 'active',
            ],
            [
                'title' => 'Кулкид',
                'skin_texture_file' => 'skins/кулкид.png',
                'model' => 'Steve',
                'category' => 'Ютуберы',
                'status' => 'active',
            ],
            [
                'title' => 'Научный сотрудник',
                'skin_texture_file' => 'skins/научный_сотрудник.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Повар',
                'skin_texture_file' => 'skins/повар.png',
                'model' => 'Steve',
                'category' => 'Милые',
                'status' => 'active',
            ],
            [
                'title' => 'Рыцарь энда',
                'skin_texture_file' => 'skins/рыцарь_энда.png',
                'model' => 'Steve',
                'category' => 'Мобы',
                'status' => 'active',
            ],
            [
                'title' => 'Стив 67',
                'skin_texture_file' => 'skins/стив_67.png',
                'model' => 'Steve',
                'category' => 'Для мальчиков',
                'status' => 'active',
            ],
            [
                'title' => 'Ученая',
                'skin_texture_file' => 'skins/ученая.png',
                'model' => 'Alex',
                'category' => 'Для девочек',
                'status' => 'active',
            ],
            [
                'title' => 'Эндермен',
                'skin_texture_file' => 'skins/эндермен.png',
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
