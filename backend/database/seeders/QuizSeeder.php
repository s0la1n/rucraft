<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $quiz = Quiz::create([
            'title' => 'Вы как мы',
            'description' => 'Ответь на 9 вопросов и узнай, на какого персонажа из нашей тусовки ты похож больше всего!',
            'is_active' => true,
        ]);

        // Вопрос 1
        $q1 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 1,
            'text' => 'Какое твое любимое животное и почему?',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q1->id, 'text' => 'Оцелот, прикольная внешность и чем-то похож на моего кота', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q1->id, 'text' => 'Хорёк, очень милые смешные, я бы съела', 'character' => 'Настя']);
        Answer::create(['question_id' => $q1->id, 'text' => 'Кошки они глупи', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q1->id, 'text' => 'Ежики, смешные колючие', 'character' => 'Самира']);

        // Вопрос 2
        $q2 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 2,
            'text' => 'Любимое всемирное зло',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q2->id, 'text' => 'Дмитрий Рябцев', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q2->id, 'text' => 'Я хз сама придумай', 'character' => 'Настя']);
        Answer::create(['question_id' => $q2->id, 'text' => 'Гитхаб', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q2->id, 'text' => 'Эпштейн', 'character' => 'Самира']);

        // Вопрос 3
        $q3 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 3,
            'text' => 'Любимый майнкрафт блок',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q3->id, 'text' => 'Аметист', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q3->id, 'text' => 'Ступенька из кварца', 'character' => 'Настя']);
        Answer::create(['question_id' => $q3->id, 'text' => 'Листья сакуры', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q3->id, 'text' => 'Листья сакуры', 'character' => 'Самира']);

        // Вопрос 4
        $q4 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 4,
            'text' => 'Любимое мем число',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q4->id, 'text' => '1337', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q4->id, 'text' => '228', 'character' => 'Настя']);
        Answer::create(['question_id' => $q4->id, 'text' => '52', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q4->id, 'text' => '67', 'character' => 'Самира']);

        // Вопрос 5
        $q5 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 5,
            'text' => 'Какой философии ты придерживаешься в жизни?',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q5->id, 'text' => 'Ну если надо какое то одно понятие, то стоицизм возможно, а так я даже не задавался таким вопросом', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q5->id, 'text' => 'Ээ хз сама че нибудь придумай я не знаю в каком стиле надо', 'character' => 'Настя']);
        Answer::create(['question_id' => $q5->id, 'text' => 'Все говно', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q5->id, 'text' => 'Я не я и карма не моя, буддизм, сиди кайфуй', 'character' => 'Самира']);

        // Вопрос 6
        $q6 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 6,
            'text' => 'Любимый трукрайм дело',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q6->id, 'text' => 'Хз, я не увлекаюсь этим', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q6->id, 'text' => 'Ня пока', 'character' => 'Настя']);
        Answer::create(['question_id' => $q6->id, 'text' => 'Невада тян/зодиак', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q6->id, 'text' => 'Человек спираль', 'character' => 'Самира']);

        // Вопрос 7
        $q7 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 7,
            'text' => 'Любимый мем',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q7->id, 'text' => '«Робот превратит кусок холста в шедевр искусства?»', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q7->id, 'text' => 'Из данганронпы где смерть типа приближается', 'character' => 'Настя']);
        Answer::create(['question_id' => $q7->id, 'text' => 'Из данганронпы где смерть типа приближается', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q7->id, 'text' => 'ОБРАЗЦОВЫЙ САМЕЦ ТАМ ДВА МУЖИКА БЛОНДИН И БРЮНЕТ', 'character' => 'Самира']);

        // Вопрос 8
        $q8 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 8,
            'text' => 'Самая говно игра',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q8->id, 'text' => 'КС 2', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q8->id, 'text' => 'Гта', 'character' => 'Настя']);
        Answer::create(['question_id' => $q8->id, 'text' => 'Дота', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q8->id, 'text' => 'Геншин', 'character' => 'Самира']);

        // Вопрос 9
        $q9 = Question::create([
            'quiz_id' => $quiz->id,
            'order' => 9,
            'text' => 'Самый близкий по духу псевдоинтеллектуальный персонаж',
            'type' => 'single_choice',
        ]);

        Answer::create(['question_id' => $q9->id, 'text' => 'Не понял вопроса', 'character' => 'Дмитрий Владимирович']);
        Answer::create(['question_id' => $q9->id, 'text' => 'Армиииин', 'character' => 'Настя']);
        Answer::create(['question_id' => $q9->id, 'text' => 'Лэйн', 'character' => 'Лиана']);
        Answer::create(['question_id' => $q9->id, 'text' => 'Никола Тесла', 'character' => 'Самира']);
    }
}
