"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageSection } from "../../components/PageSection";
import { MinesweeperCaptcha } from "../../components/MinesweeperCaptcha";
import styles from './register.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const ACTION_REGISTER = `${API_BASE}/register`;

export default function RegisterPage() {
  const router = useRouter();
  const { register: doRegister } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!captchaPassed) {
      setError("Сначала пройдите капчу-сапёр!");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get("name") as string)?.trim() ?? "";
    const login = (fd.get("login") as string)?.trim() ?? "";
    const email = (fd.get("email") as string)?.trim() ?? "";
    const password = (fd.get("password") as string) ?? "";
    const password_confirmation = (fd.get("password_confirmation") as string) ?? "";

    try {
      await doRegister({ name, login, email, password, password_confirmation });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageContent}>
      <PageSection title="">
        <h1 className={styles.sectionTitle}>РЕГИСТРАЦИЯ</h1>
        <form action={ACTION_REGISTER} method="post" onSubmit={handleSubmit} className={styles.formStack}>
          {error && <p className={styles.formError}>{error}</p>}
          
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              autoComplete="name" 
              required 
              placeholder="Как к вам обращаться" 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="login">Логин (ник)</label>
            <input 
              id="login" 
              name="login" 
              type="text" 
              autoComplete="username" 
              required 
              placeholder="Уникальный логин" 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Почта</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              placeholder="email@example.com" 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="new-password" 
              required 
              placeholder="Пароль" 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password_confirmation">Повтор пароля</label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Повторите пароль"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gender">Пол</label>
            <select
              id="gender"
              name="gender"
              defaultValue="Женщина"
              className={styles.formSelect}
            >
              <option value="Женщина">Женщина</option>
              <option value="Ошибка человечества">Ошибка человечества</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="card_number">Номер карты</label>
            <input
              id="card_number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="card_expiry">Срок действия</label>
              <input
                id="card_expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="card_cvc">CVC</label>
              <input
                id="card_cvc"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          <MinesweeperCaptcha onVerify={setCaptchaPassed} />

          <button
            type="submit"
            disabled={loading || !captchaPassed}
            className={styles.btnSubmit}
          >
            {loading ? "Регистрация…" : "зАРЕГИСТРИРОВАТЬСЯ"}
          </button>
        </form>
        
        <p className={styles.formLink}>
          Уже есть аккаунт? <Link href="/auth/login">Вход</Link>
        </p>
      </PageSection>
    </div>
  );
}