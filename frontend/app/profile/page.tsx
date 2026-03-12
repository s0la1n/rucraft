"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "../components/RequireAuth";
import { profileApi } from "@/lib/api";
import { useAuth } from "../context/AuthContext";
import "./profile.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const ACTION_PROFILE = `${API_BASE}/profile`;

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    profileApi
      .show()
      .then(({ user }) => {
        setName(user.name);
        setLogin(user.login);
        setEmail(user.email);
      })
      .catch(() => setLoadError("Не удалось загрузить профиль"));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSuccess(false);
    setLoading(true);
    const body: Parameters<typeof profileApi.update>[0] = { name, login, email };
    if (password) {
      body.password = password;
      body.password_confirmation = passwordConfirmation;
    }
    try {
      await profileApi.update(body);
      setPassword("");
      setPasswordConfirmation("");
      setSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout(); // вызывает AuthController.logout в api
    } finally {
      router.replace("/auth/login");
      router.refresh();
    }
  }

  return (
    <RequireAuth>
      <div className="profile-main">
        <h2>Профиль</h2>

        <div className="profile-layout">

          <div className="profile-card">
            <div className="profile-card-info">
              <div className="profile-labels">
                <span>Ник:</span>
                <span>Логин:</span>
                <span>Почта:</span>
              </div>
              <div className="profile-values">
                <span>{name}</span>
                <span>{login}</span>
                <span>{email}</span>
              </div>
            </div>

            <form action={ACTION_PROFILE} method="post" onSubmit={handleSubmit} className="profile-form">
              {loadError && <p className="profile-error">{loadError}</p>}
              {saveError && <p className="profile-error">{saveError}</p>}
              {success && <p className="profile-success">Профиль сохранён.</p>}

              <div className="profile-inputs">
                <input id="name" name="name" type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
                <input id="login" name="login" type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} />
                <input id="email" name="email" type="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input id="password" name="password" type="password" placeholder="Новый пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                <input id="password_confirmation" name="password_confirmation" type="password" placeholder="Повтор пароля" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
              </div>

              <button type="submit" disabled={loading} className="profile-save-btn">
                {loading ? "Сохранение…" : "Сохранить"}
              </button>
            </form>
          </div>

          <div className="profile-photo">
            <img src="/profile/свага.png" alt="Мем 1" className="photo" />
          </div>
        </div>
        
        <button type="button" className="profile-exit-btn" onClick={handleLogout}>ВЫЙТИ</button>
      </div>
    </RequireAuth>
  );
}
