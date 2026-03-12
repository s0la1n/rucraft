<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QuizController extends Controller
{
    public function show()
    {
        $quiz = Quiz::with('questions.answers')
            ->where('is_active', true)
            ->firstOrFail();

        return view('quiz.show', compact('quiz'));
    }

    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'answers' => 'required|array',
        ]);

        $quiz = Quiz::with('questions.answers')
            ->where('is_active', true)
            ->firstOrFail();

        $answers = $request->input('answers', []);
        $characterCounts = [
            'Дмитрий Владимирович' => 0,
            'Настя' => 0,
            'Лиана' => 0,
            'Самира' => 0,
        ];

        foreach ($answers as $questionId => $answerId) {
            $answer = $quiz->questions
                ->flatMap->answers
                ->find($answerId);

            if ($answer && $answer->character) {
                $characterCounts[$answer->character]++;
            }
        }

        // Определяем победителя
        $maxCount = max($characterCounts);
        $result = null;

        $results = [
            'Дмитрий Владимирович' => [
                'title' => 'Секретный персонаж Дмитрий Владимирович',
                'quote' => 'Регина, прост, тест не прошла',
            ],
            'Настя' => [
                'title' => '1С Герой Настя',
                'quote' => null,
            ],
            'Лиана' => [
                'title' => 'Лучшая просто Лиана',
                'quote' => null,
            ],
            'Самира' => [
                'title' => 'Любимая рыжуля Самира',
                'quote' => null,
            ],
        ];

        foreach ($characterCounts as $character => $count) {
            if ($count === $maxCount && $count > 0) {
                $result = [
                    'character' => $character,
                    'title' => $results[$character]['title'],
                    'quote' => $results[$character]['quote'],
                    'count' => $count,
                ];
                break;
            }
        }

        if (!$result) {
            $result = [
                'character' => 'Неизвестно',
                'title' => 'Хз кто ты',
                'quote' => 'Надо было ответы выбрать',
                'count' => 0,
            ];
        }

        return response()->json([
            'success' => true,
            'result' => $result,
            'characterCounts' => $characterCounts,
        ]);
    }
}
