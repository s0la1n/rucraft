<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Developer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeveloperSeeder extends Seeder
{
    public function run(): void
    {
        $developers = [
            [
                'name' => 's0la1n',
                'role' => 'Гуру бэкенда',
                'skin' => 'developers/лиана.png',
                'bio' => 'Архитектор цифровой кухни — там, где «варятся» данные и рождаются ответы на запросы. Строит невидимые мосты между интерфейсами и базами, пишет код, который не видит пользователь, но без которого ничего не работает. Владеет древними языками: Python, Java, PHP, Node.js.',
                'telegram' => '@s0la1n',
                'vk' => '@s0la1n',
            ],
            [
                'name' => 'mikamikisser',
                'role' => 'Креативный двигатель',
                'skin' => 'developers/наиля.png',
                'bio' => 'Человек‑идея: в голове — бесконечный поток вдохновения, в руках — графический планшет и магия Adobe. Рисует миры, оживляет логотипы, делает так, чтобы сайт хотелось разглядывать часами. Его работы не просто видят — их запоминают.',
                'telegram' => '@mikamikisser',
                'vk' => '@mikamikisser',
            ],
            [
                'name' => 'memesori',
                'role' => 'Мастер баз данных',
                'skin' => 'developers/настя.png',
                'bio' => 'Волшебник больших данных: укрощает гигабайты информации, строит лабиринты таблиц, где каждый бит на своём месте. Умеет заставить базу отвечать за доли секунды и прячет секреты за семью замками. Его инструменты — SQL‑заклинания и магия индексов.',
                'telegram' => '@saladarmin',
                'vk' => '@saladarmin',
            ],
            [
                'name' => 'zushon',
                'role' => 'Волшебница фронтенда',
                'skin' => 'developers/регина.png',
                'bio' => 'Та самая волшебница, которая оживляет дизайн: превращает статичные макеты в интерактивные шедевры, заставляет кнопки мерцать в такт, а анимации — завораживать. Владеет заклинаниями HTML, CSS и JavaScript, а также секретными рунами React/Vue.',
                'telegram' => '@zushon',
                'vk' => '@zushon',
            ],
            [
                'name' => 'levlafan1',
                'role' => 'Тестировщик от бога',
                'skin' => 'developers/самира1.png',
                'bio' => 'Супергерой с рентгеновским зрением для кода: находит баги там, где их не видит никто, ломает приложение (чтобы потом починить), проверяет каждую кнопку и форму. Его девиз: «Если не сломалось у меня — значит, сломается у пользователя».',
                'telegram' => '@levlafan1',
                'vk' => '@levlafan1',
            ],
        ];

        foreach ($developers as $developerData) {
            $user = User::where('name', $developerData['name'])->first();

            if (!$user) {
                continue;
            }

            Developer::updateOrCreate(
                [
                    'user_id' => $user->id,
                ],
                array_merge($developerData, [
                    'user_id' => $user->id,
                ])
            );
        }
    }
}
