<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Результат теста - RuCraft</title>
    <link rel="stylesheet" href="/css/quiz.css">
</head>
<body>
    <div class="quiz-container">
        <div class="result-card">
            <div class="result-header">
                <h1>Твой результат</h1>
            </div>

            <div class="result-content">
                <h2 class="result-title">{{ $result['title'] }}</h2>
                
                @if($result['quote'])
                    <p class="result-quote">«{{ $result['quote'] }}»</p>
                @endif

                <div class="result-stats">
                    <h3>Распределение ответов:</h3>
                    <ul class="stats-list">
                        @foreach($characterCounts as $character => $count)
                            <li class="stat-item">
                                <span class="stat-character">{{ $character }}</span>
                                <span class="stat-count">{{ $count }} из {{ $quiz->questions->count() }}</span>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>

            <div class="result-actions">
                <a href="{{ route('quiz.show') }}" class="btn btn-submit">Пройти ещё раз</a>
            </div>
        </div>
    </div>
</body>
</html>
