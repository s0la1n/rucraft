"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface QuizResult {
  character: string;
  title: string;
  quote: string | null;
  count: number;
}

interface CharacterCounts {
  [key: string]: number;
}

interface Answer {
  id: number;
  question_id: number;
  text: string;
  character: string;
}

interface UserAnswers {
  [questionId: number]: number;
}

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [characterCounts, setCharacterCounts] = useState<CharacterCounts | null>(null);
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('quizResult');
    const storedCounts = sessionStorage.getItem('quizCharacterCounts');
    const storedAllAnswers = sessionStorage.getItem('quizAllAnswers');
    const storedUserAnswers = sessionStorage.getItem('quizUserAnswers');

    if (storedResult && storedCounts && storedAllAnswers && storedUserAnswers) {
      setResult(JSON.parse(storedResult));
      setCharacterCounts(JSON.parse(storedCounts));
      setAllAnswers(JSON.parse(storedAllAnswers));
      setUserAnswers(JSON.parse(storedUserAnswers));
    } else {
      router.push('/quizzes');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="quizzes-loading">
          <p className="section-title-cyan">Загрузка результата...</p>
        </div>
      </div>
    );
  }

  if (!result || !characterCounts) {
    return (
      <div className="page-content">
        <div className="quizzes-error">
          <p className="section-title-cyan">Ошибка загрузки результата</p>
        </div>
      </div>
    );
  }

  // Группируем ответы по вопросам
  const questions = Object.keys(userAnswers).map(qId => Number(qId));
  
  // Получаем все ответы для каждого вопроса
  const getAnswersForQuestion = (questionId: number) => {
    return allAnswers.filter(a => a.question_id === questionId);
  };

  // Получаем выбранный пользователем ответ для вопроса
  const getUserAnswer = (questionId: number) => {
    const answerId = userAnswers[questionId];
    return allAnswers.find(a => a.id === answerId);
  };

  return (
    <div className="page-content">
      <div className="quiz-result-container">
        <div className="quiz-result-header">
          <h1 className="quiz-result-main-title">Твой результат</h1>
        </div>

        <div className="quiz-result-content">
          <h2 className="quiz-result-title">{result.title}</h2>
          
          {result.quote && (
            <p className="quiz-result-quote">"{result.quote}"</p>
          )}

          <div className="quiz-result-stats">
            <h3 className="quiz-result-stats-title">Распределение ответов:</h3>
            <ul className="quiz-stats-list">
              {Object.entries(characterCounts).map(([character, count]) => (
                <li 
                  key={character} 
                  className={`quiz-stat-item ${character === result.character ? 'highlight' : ''}`}
                >
                  <span className="quiz-stat-character">{character}</span>
                  <span className="quiz-stat-count">{count} совпадений</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Карточки с ответами */}
        <div className="quiz-answers-review">
          <h3 className="quiz-answers-review-title">Твои ответы:</h3>
          <div className="quiz-answers-grid">
            {questions.map((questionId, index) => {
              const userAnswer = getUserAnswer(questionId);
              const questionAnswers = getAnswersForQuestion(questionId);
              
              return (
                <div key={questionId} className="quiz-answer-card">
                  <div className="quiz-answer-card-header">
                    <span className="quiz-answer-card-number">Вопрос {index + 1}</span>
                  </div>
                  <div className="quiz-answer-card-body">
                    {userAnswer ? (
                      <div className="quiz-user-answer">
                        <span className="quiz-answer-label">Твой ответ:</span>
                        <p className="quiz-answer-text">{userAnswer.text}</p>
                        <span className="quiz-answer-character">
                          → {userAnswer.character}
                        </span>
                      </div>
                    ) : (
                      <p className="quiz-no-answer">Нет ответа</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="quiz-result-actions">
          <Link href={`/quizzes/${params.id}`} className="quiz-btn quiz-btn-submit">
            Пройти ещё раз
          </Link>
          <Link href="/quizzes" className="quiz-btn quiz-btn-prev">
            К списку тестов
          </Link>
        </div>
      </div>
    </div>
  );
}
