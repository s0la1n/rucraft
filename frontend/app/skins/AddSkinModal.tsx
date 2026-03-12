"use client";

import { useState, useRef } from "react";
import { skinsApi } from "@/lib/api";

const CATEGORIES = ["Смешные", "Для девочек", "Для мальчиков", "Аниме", "Мобы", "Милые", "Ютуберы"] as const;
const MODELS = ["Steve", "Alex"] as const;
const ALLOWED_TYPES = ["image/png"];
const MAX_SIZE_MB = 20;

type Props = { open: boolean; onClose: () => void; onSuccess?: () => void };

export function AddSkinModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [model, setModel] = useState<string>(MODELS[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Разрешён только формат PNG.");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Размер файла не более ${MAX_SIZE_MB} МБ.`);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Введите название скина.");
      return;
    }
    if (!file) {
      setError("Выберите файл скина (PNG).");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("category", category);
      formData.set("model", model);
      if (description.trim()) formData.set("description", description.trim());
      formData.set("skin_file", file);
      console.log('[AddSkinModal] Отправка формы:', { title, category, model, description: description.trim(), fileName: file.name, fileSize: file.size });
      const response = await skinsApi.create(formData);
      console.log('[AddSkinModal] Ответ сервера:', response);
      setTitle("");
      setCategory(CATEGORIES[0]);
      setModel(MODELS[0]);
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('[AddSkinModal] Ошибка:', err);
      setError(err instanceof Error ? err.message : "Не удалось добавить скин.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-skin-title">
      <div className="modal-content add-skin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="add-skin-title">Добавить скин</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <p className="form-error">{error}</p>}
          <div className="form-group">
            <label htmlFor="skin-title">Название *</label>
            <input
              id="skin-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Название скина"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="skin-category">Категория *</label>
            <select id="skin-category" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="skin-model">Модель *</label>
            <select id="skin-model" value={model} onChange={(e) => setModel(e.target.value)} required>
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="skin-description">Описание (необязательно)</label>
            <textarea
              id="skin-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Опишите ваш скин..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="skin-file">Файл скина (PNG) *</label>
            <input
              ref={fileInputRef}
              id="skin-file"
              type="file"
              accept=".png,image/png"
              onChange={handleFileChange}
              required={!file}
            />
            {file && <p className="form-hint">Выбран: {file.name}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Отправка…" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
