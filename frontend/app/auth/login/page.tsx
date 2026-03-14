"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageSection } from "../../components/PageSection";
import styles from './login.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const form = e.currentTarget;
    const fd = new FormData(form);
    const loginVal = (fd.get("login") as string)?.trim() ?? "";
    const password = (fd.get("password") as string) ?? "";
    
    try {
      //сначала получаем CSRF cookie
      await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        credentials: 'include'
      });
      
      await login(loginVal, password);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageContent}>
      <PageSection title="">
        <h1 className={styles.sectionTitle}>ВХОД</h1>
        <form onSubmit={handleSubmit} className={styles.formStack}>
          {error && <p className={styles.formError}>{error}</p>}
          
          <div className={styles.formGroup}>
            <label htmlFor="login">Логин или почта</label>
            <input 
              id="login" 
              name="login" 
              type="text" 
              autoComplete="username" 
              required 
              placeholder="Логин или email" 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              placeholder="Пароль" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className={styles.btnSubmit}
          >
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
        
        <p className={styles.formLink}>
          Нет аккаунта? <Link href="/auth/register">Регистрация</Link>
        </p>
      </PageSection>
    </div>
  );
}