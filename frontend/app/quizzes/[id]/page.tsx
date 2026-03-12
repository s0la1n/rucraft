"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBackendBaseUrl } from "@/lib/api";

interface Question {
  id: number;
  text: string;
  type: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  text: string;
  character: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const backendUrl = getBackendBaseUrl();
        const quizId = params.id;
        const url = `${backendUrl}/api/quizzes/${quizId}`;
        console.log('[QuizPage] Fetching from:', url);
        console.log('[QuizPage] Quiz ID:', quizId);
        const response = await fetch(url);
        console.log('[QuizPage] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[QuizPage] Error response:', errorText);
          throw new Error(`Ошибка ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('[QuizPage] Received data:', data);
        setQuiz(data);
      } catch (err) {
        console.error('[QuizPage] Error:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params.id]);

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleNext = () => {
    if (currentStep < (quiz?.questions.length || 0) - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const backendUrl = getBackendBaseUrl();
      const url = `${backendUrl}/api/quizzes/submit`;
      console.log('[QuizPage] Submitting to:', url);
      console.log('[QuizPage] Answers:', answers);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      console.log('[QuizPage] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[QuizPage] Error response:', errorText);
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[QuizPage] Result data:', data);
      
      // Сохраняем результат и переходим на страницу результата
      sessionStorage.setItem('quizResult', JSON.stringify(data.result));
      sessionStorage.setItem('quizCharacterCounts', JSON.stringify(data.characterCounts));
      sessionStorage.setItem('quizAllAnswers', JSON.stringify(data.allAnswers));
      sessionStorage.setItem('quizUserAnswers', JSON.stringify(answers));
      router.push(`/quizzes/${params.id}/result`);
    } catch (err) {
      console.error('[QuizPage] Submit error:', err);
      alert('Произошла ошибка при отправке теста: ' + (err instanceof Error ? err.message : err));
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="quizzes-loading">
          <p className="section-title-cyan">Загрузка теста...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="page-content">
        <div className="quizzes-error">
          <p className="section-title-cyan">Ошибка: {error || 'Тест не найден'}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentStep];
  const progress = ((currentStep + 1) / quiz.questions.length) * 100;

  return (
    <div className="page-content">
      <div className="quiz-take-container">
        <div className="quiz-take-header">
          <h1 className="quiz-take-title">{quiz.title}</h1>
          <p className="quiz-take-description">{quiz.description}</p>
        </div>

        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="quiz-progress-text">Вопрос {currentStep + 1} из {quiz.questions.length}</p>

        <div className="quiz-question-card">
          <p className="quiz-question-number">Вопрос {currentStep + 1}</p>
          <h2 className="quiz-question-text">{currentQuestion.text}</h2>

          <div className="quiz-answers-list">
            {currentQuestion.answers.map((answer) => (
              <label
                key={answer.id}
                className={`quiz-answer-option ${answers[currentQuestion.id] === answer.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={answer.id}
                  checked={answers[currentQuestion.id] === answer.id}
                  onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                />
                <span className="quiz-answer-text">{answer.text}</span>
              </label>
            ))}
          </div>

          <div className="quiz-navigation">
            {currentStep > 0 && (
              <button className="quiz-btn quiz-btn-prev" onClick={handlePrev}>
                Назад
              </button>
            )}
            {currentStep < quiz.questions.length - 1 ? (
              <button 
                className="quiz-btn quiz-btn-next" 
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                Далее
              </button>
            ) : (
              <button 
                className="quiz-btn quiz-btn-submit" 
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.questions.length}
              >
                Узнать результат
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
