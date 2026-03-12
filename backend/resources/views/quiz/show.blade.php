<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $quiz->title }} - RuCraft</title>
    <link rel="stylesheet" href="/css/quiz.css">
</head>
<body>
    <div class="quiz-container">
        <div class="quiz-header">
            <h1>{{ $quiz->title }}</h1>
            <p class="quiz-description">{{ $quiz->description }}</p>
        </div>

        <form action="{{ route('quiz.submit') }}" method="POST" id="quiz-form">
            @csrf
            
            @foreach($quiz->questions as $index => $question)
                <div class="question-card {{ $index === 0 ? 'active' : '' }}" data-step="{{ $index }}">
                    <div class="question-number">Вопрос {{ $index + 1 }} из {{ $quiz->questions->count() }}</div>
                    <h2 class="question-text">{{ $question->text }}</h2>
                    
                    <div class="answers-list">
                        @foreach($question->answers as $answer)
                            <label class="answer-option">
                                <input type="radio" name="answers[{{ $question->id }}]" value="{{ $answer->id }}" required>
                                <span class="answer-text">{{ $answer->text }}</span>
                            </label>
                        @endforeach
                    </div>

                    <div class="question-navigation">
                        @if($index > 0)
                            <button type="button" class="btn btn-prev" data-step="{{ $index - 1 }}">Назад</button>
                        @endif
                        @if($index < $quiz->questions->count() - 1)
                            <button type="button" class="btn btn-next" data-step="{{ $index + 1 }}">Далее</button>
                        @else
                            <button type="submit" class="btn btn-submit">Узнать результат</button>
                        @endif
                    </div>
                </div>
            @endforeach
        </form>

        <div class="quiz-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: {{ 100 / $quiz->questions->count() }}%"></div>
            </div>
            <span class="progress-text">Вопрос 1 из {{ $quiz->questions->count() }}</span>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.question-card');
            const prevButtons = document.querySelectorAll('.btn-prev');
            const nextButtons = document.querySelectorAll('.btn-next');
            const progressFill = document.querySelector('.progress-fill');
            const progressText = document.querySelector('.progress-text');
            const totalSteps = cards.length;

            function showStep(step) {
                cards.forEach((card, index) => {
                    card.classList.toggle('active', index === step);
                });
                
                const progress = ((step + 1) / totalSteps) * 100;
                progressFill.style.width = progress + '%';
                progressText.textContent = `Вопрос ${step + 1} из ${totalSteps}`;
            }

            prevButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const step = parseInt(this.dataset.step);
                    showStep(step);
                });
            });

            nextButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const step = parseInt(this.dataset.step);
                    const currentCard = document.querySelector(`.question-card[data-step="${step - 1}"]`);
                    const selectedAnswer = currentCard.querySelector('input[type="radio"]:checked');
                    
                    if (selectedAnswer) {
                        showStep(step);
                    } else {
                        alert('Пожалуйста, выберите вариант ответа!');
                    }
                });
            });
        });
    </script>
</body>
</html>
