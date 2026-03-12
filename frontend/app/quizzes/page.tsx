"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendBaseUrl } from "@/lib/api";

interface Quiz {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const backendUrl = getBackendBaseUrl();
        const url = `${backendUrl}/api/quizzes`;
        console.log('[QuizzesPage] Fetching from:', url);
        const response = await fetch(url);
        console.log('[QuizzesPage] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[QuizzesPage] Error response:', errorText);
          throw new Error(`Ошибка ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('[QuizzesPage] Received data:', data);
        setQuizzes(data);
      } catch (err) {
        console.error('[QuizzesPage] Error:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="page-content">
        <div className="quizzes-loading">
          <p className="section-title-cyan">Загрузка тестов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="quizzes-error">
          <p className="section-title-cyan">Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="page-content">
        <p className="section-title-cyan">Тестов пока нет</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="section-title-cyan">Тесты</h1>

      <div className="quizzes-grid">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quizzes/${quiz.id}`}
            className="quiz-card"
          >
            <div className="quiz-card-header">
              <h2 className="quiz-card-title">{quiz.title}</h2>
            </div>
            <div className="quiz-card-body">
              <p className="quiz-card-description">{quiz.description}</p>
            </div>
            <div className="quiz-card-footer">
              <span className="quiz-card-btn">Пройти тест</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
