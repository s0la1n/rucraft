"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "../components/RequireAuth";
import { PageSection } from "../components/PageSection";
import { profileApi } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const ACTION_PROFILE = `${API_BASE}/profile`;

export default function ProfilePage() {
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

  return (
    <RequireAuth>
      <div className="page-content page-narrow">
        <PageSection title="Профиль">
          {loadError && <p className="form-error">{loadError}</p>}
          <form action={ACTION_PROFILE} method="post" onSubmit={handleSubmit} className="form-stack">
            {saveError && <p className="form-error">{saveError}</p>}
            {success && <p className="form-success">Профиль сохранён.</p>}
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="login">Логин</label>
              <input id="login" name="login" type="text" value={login} onChange={(e) => setLogin(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Почта</label>
              <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Новый пароль (оставьте пустым, чтобы не менять)</label>
              <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="password_confirmation">Повтор пароля</label>
              <input id="password_confirmation" name="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Сохранение…" : "Сохранить"}
            </button>
          </form>
        </PageSection>
      </div>
    </RequireAuth>
  );
}
