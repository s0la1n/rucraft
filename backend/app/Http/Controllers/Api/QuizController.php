<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(): JsonResponse
    {
        $quizzes = Quiz::where('is_active', true)
            ->select('id', 'title', 'description', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($quizzes);
    }

    public function show(int $id): JsonResponse
    {
        $quiz = Quiz::with(['questions.answers'])
            ->where('is_active', true)
            ->find($id);

        if (!$quiz) {
            return response()->json(['error' => 'Quiz not found'], 404);
        }

        return response()->json($quiz);
    }

    public function submit(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'answers' => 'required|array',
            ]);

            $quiz = Quiz::with('questions.answers')
                ->where('is_active', true)
                ->firstOrFail();

            $answers = $request->input('answers', []);
            
            if (empty($answers)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No answers provided',
                ], 400);
            }

            $characterCounts = [
                'Дмитрий Владимирович' => 0,
                'Настя' => 0,
                'Лиана' => 0,
                'Самира' => 0,
            ];

            foreach ($answers as $questionId => $answerId) {
                $answer = $quiz->questions
                    ->flatMap->answers
                    ->firstWhere('id', $answerId);

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
                'allAnswers' => $quiz->questions->flatMap(fn($q) => $q->answers)->map(fn($a) => [
                    'id' => $a->id,
                    'question_id' => $a->question_id,
                    'text' => $a->text,
                    'character' => $a->character,
                ]),
            ]);
        } catch (\Exception $e) {
            \Log::error('Quiz submit error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
