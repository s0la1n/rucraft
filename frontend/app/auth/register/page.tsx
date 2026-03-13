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
  
  // Состояния для полей с масками
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Валидация имени: только русские буквы, пробелы и дефисы
  const validateName = (value: string) => {
    const regex = /^[а-яА-ЯёЁ\s-]*$/;
    return regex.test(value);
  };

  // Валидация логина: только английские буквы и цифры
  const validateLogin = (value: string) => {
    const regex = /^[a-zA-Z0-9]*$/;
    return regex.test(value);
  };

  // Валидация email: должен заканчиваться на .ru или .com
  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.(ru|com)$/i;
    return regex.test(value);
  };

  // Маска для номера карты: XXXX XXXX XXXX XXXX
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(" ").substring(0, 19);
  };

  // Маска для срока действия: MM/YY
  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    return `${numbers.substring(0, 2)}/${numbers.substring(2, 4)}`;
  };

  // Маска для CVC: только цифры, максимум 4
  const formatCvc = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 4);
  };

  // Обработчики изменений
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateName(value) || value === "") {
      setName(value);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateLogin(value) || value === "") {
      setLogin(value);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardExpiry(formatted);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCvc(e.target.value);
    setCardCvc(formatted);
  };

  // Валидация перед отправкой
  const validateForm = (): string | null => {
    if (!name.trim()) {
      return "Имя обязательно для заполнения";
    }
    if (!validateName(name)) {
      return "Имя может содержать только русские буквы, пробелы и дефисы";
    }

    if (!login.trim()) {
      return "Логин обязателен для заполнения";
    }
    if (!validateLogin(login)) {
      return "Логин может содержать только английские буквы и цифры";
    }

    if (!email.trim()) {
      return "Email обязателен для заполнения";
    }
    if (!validateEmail(email)) {
      return "Email должен быть в формате user@domain.ru или user@domain.com";
    }

    return null;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!captchaPassed) {
      setError("Сначала пройдите капчу-сапёр!");
      return;
    }

    // Валидация формы
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = (fd.get("password") as string) ?? "";
    const password_confirmation = (fd.get("password_confirmation") as string) ?? "";

    try {
      await doRegister({ 
        name, 
        login, 
        email, 
        password, 
        password_confirmation 
      });
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
              value={name}
              onChange={handleNameChange}
              className={styles.formInput}
            />
            <small className={styles.inputHint}>Только русские буквы, пробелы и дефисы</small>
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
              value={login}
              onChange={handleLoginChange}
              className={styles.formInput}
            />
            <small className={styles.inputHint}>Только английские буквы и цифры</small>
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
              value={email}
              onChange={handleEmailChange}
              className={styles.formInput}
            />
            <small className={styles.inputHint}>Должен заканчиваться на .ru или .com</small>
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
              name="card_number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="card_expiry">Срок действия</label>
              <input
                id="card_expiry"
                name="card_expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={handleExpiryChange}
                maxLength={5}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="card_cvc">CVC</label>
              <input
                id="card_cvc"
                name="card_cvc"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                value={cardCvc}
                onChange={handleCvcChange}
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