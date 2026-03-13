"use client";

import { useState, useRef } from "react";
import { seedsApi } from "@/lib/api";
import styles from './add-seed-modal.module.css';

const VERSIONS = ["java", "bedrock", "java_bedrock"] as const;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE_MB = 20;

type Props = { open: boolean; onClose: () => void; onSuccess?: () => void };

export function AddSeedModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [seedNumber, setSeedNumber] = useState("");
  const [version, setVersion] = useState<string>(VERSIONS[0]);
  const [minecraftRelease, setMinecraftRelease] = useState("");
  const [description, setDescription] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [z, setZ] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) {
      setImageFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Разрешён только формат PNG или JPG.");
      setImageFile(null);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Размер файла не более ${MAX_SIZE_MB} МБ.`);
      setImageFile(null);
      e.target.value = "";
      return;
    }
    setImageFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Введите название сида.");
      return;
    }
    if (!seedNumber.trim()) {
      setError("Введите номер сида.");
      return;
    }
    if (!x.trim()) {
      setError("Введите координату X.");
      return;
    }
    if (!y.trim()) {
      setError("Введите координату Y.");
      return;
    }
    if (!z.trim()) {
      setError("Введите координату Z.");
      return;
    }
    if (!imageFile) {
      setError("Выберите изображение сида (PNG/JPG).");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("seed_number", seedNumber.trim());
      formData.set("version", version);
      if (minecraftRelease.trim()) {
        formData.set("minecraft_release", minecraftRelease.trim());
      }
      if (description.trim()) {
        formData.set("description", description.trim());
      }
      formData.set("x", x.trim());
      formData.set("y", y.trim());
      formData.set("z", z.trim());
      formData.set("image_file", imageFile);

      console.log('[AddSeedModal] Отправка формы:', { 
        title, 
        seedNumber, 
        version, 
        minecraftRelease: minecraftRelease.trim(),
        description: description.trim(),
        x, y, z,
        imageFileName: imageFile.name, 
        imageFileSize: imageFile.size
      });

      const response = await seedsApi.create(formData);
      console.log('[AddSeedModal] Ответ сервера:', response);

      setTitle("");
      setSeedNumber("");
      setVersion(VERSIONS[0]);
      setMinecraftRelease("");
      setDescription("");
      setX("");
      setY("");
      setZ("");
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('[AddSeedModal] Ошибка:', err);
      setError(err instanceof Error ? err.message : "Не удалось добавить сид.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-seed-title">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="add-seed-title">Добавить сид</h2>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {error && <p className={styles.formError}>{error}</p>}
          
          <div className={styles.formGroup}>
            <label htmlFor="seed-title">Название *</label>
            <input
              id="seed-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Название сида"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="seed-number">Номер сида *</label>
            <input
              id="seed-number"
              type="text"
              value={seedNumber}
              onChange={(e) => setSeedNumber(e.target.value)}
              maxLength={100}
              placeholder="Например: -1234567890"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="seed-version">Версия *</label>
            <select id="seed-version" value={version} onChange={(e) => setVersion(e.target.value)} required>
              {VERSIONS.map((v) => (
                <option key={v} value={v}>
                  {v === "java" ? "Java" : v === "bedrock" ? "Bedrock" : "Java + Bedrock"}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="seed-minecraft-release">Релиз Minecraft (необязательно)</label>
            <input
              id="seed-minecraft-release"
              type="text"
              value={minecraftRelease}
              onChange={(e) => setMinecraftRelease(e.target.value)}
              maxLength={50}
              placeholder="Например: 1.20.1"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="seed-description">Описание (необязательно)</label>
            <textarea
              id="seed-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              placeholder="Опишите особенности сида..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Координаты *</label>
            <div className={styles.coordinatesRow}>
              <div className={styles.coordinateInput}>
                <label htmlFor="seed-x">X</label>
                <input
                  id="seed-x"
                  type="number"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className={styles.coordinateInput}>
                <label htmlFor="seed-y">Y</label>
                <input
                  id="seed-y"
                  type="number"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className={styles.coordinateInput}>
                <label htmlFor="seed-z">Z</label>
                <input
                  id="seed-z"
                  type="number"
                  value={z}
                  onChange={(e) => setZ(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="seed-image-file">Изображение (PNG/JPG) *</label>
            <input
              ref={imageInputRef}
              id="seed-image-file"
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={handleImageFileChange}
              required={!imageFile}
            />
            {imageFile && <p className={styles.formHint}>Выбран: {imageFile.name}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={submitting}>
              {submitting ? "Отправка…" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}