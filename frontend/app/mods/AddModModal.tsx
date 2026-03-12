"use client";

import { useState, useRef } from "react";
import { modsApi } from "@/lib/api";

// Объединяем варианты версий
const VERSIONS = ["java", "bedrock", "forge", "fabric", "quilt", "java_bedrock"] as const;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ALLOWED_EXTENSIONS = [".jar", ".zip"];
const MAX_IMAGE_SIZE_MB = 20;
const MAX_FILE_SIZE_MB = 100; // твой лимит больше (100MB против 50MB)

type Props = { open: boolean; onClose: () => void; onSuccess?: () => void };

export function AddModModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState<string>(VERSIONS[0]);
  const [minecraftVersion, setMinecraftVersion] = useState("");
  
  // Объединяем состояния из обоих подходов
  const [imageFile, setImageFile] = useState<File | null>(null); // для твоего подхода (одно изображение)
  const [modFile, setModFile] = useState<File | null>(null); // для файла мода
  const [additionalImages, setAdditionalImages] = useState<File[]>([]); // для дополнительных изображений (из чужого кода)
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const modInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);

  // Обработка основного изображения (твой подход)
  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) {
      setImageFile(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      setError("Разрешён только формат PNG или JPG.");
      setImageFile(null);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Размер файла не более ${MAX_IMAGE_SIZE_MB} МБ.`);
      setImageFile(null);
      e.target.value = "";
      return;
    }
    setImageFile(f);
  }

  // Обработка файла мода (объединяем проверки)
  function handleModFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) {
      setModFile(null);
      return;
    }
    
    const fileExt = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setError("Разрешены только файлы .jar или .zip");
      setModFile(null);
      e.target.value = "";
      return;
    }
    
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Размер файла не более ${MAX_FILE_SIZE_MB} МБ.`);
      setModFile(null);
      e.target.value = "";
      return;
    }
    setModFile(f);
  }

  // Обработка дополнительных изображений (из чужого кода)
  function handleAdditionalImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setError(null);
    
    const validImages: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        setError("Разрешены только изображения.");
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError("Размер дополнительного изображения не более 5 МБ.");
        continue;
      }
      validImages.push(f);
    }
    
    setAdditionalImages(validImages);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Введите название мода.");
      return;
    }
    
    // Объединяем проверки из обоих подходов
    if (!description.trim()) {
      setError("Введите описание мода.");
      return;
    }
    
    if (!imageFile) {
      setError("Выберите изображение мода (PNG/JPG).");
      return;
    }
    
    if (!modFile) {
      setError("Выберите файл мода (.jar или .zip).");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("description", description.trim());
      formData.set("version", version);
      if (minecraftVersion.trim()) {
        formData.set("minecraft_version", minecraftVersion.trim());
      }
      
      // Основное изображение (твое)
      formData.set("image_file", imageFile);
      
      // Файл мода
      formData.set("mod_file", modFile);
      
      // Дополнительные изображения (из чужого кода)
      additionalImages.forEach((img) => {
        formData.append("images[]", img);
      });

      console.log('[AddModModal] Отправка формы:', { 
        title, 
        description: description.trim(), 
        version, 
        minecraftVersion: minecraftVersion.trim(),
        imageFileName: imageFile.name, 
        modFileName: modFile.name,
        additionalImagesCount: additionalImages.length
      });

      const response = await modsApi.create(formData);
      console.log('[AddModModal] Ответ сервера:', response);

      // Очищаем все состояния
      setTitle("");
      setDescription("");
      setVersion(VERSIONS[0]);
      setMinecraftVersion("");
      setImageFile(null);
      setModFile(null);
      setAdditionalImages([]);
      
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (modInputRef.current) modInputRef.current.value = "";
      if (additionalImagesRef.current) additionalImagesRef.current.value = "";
      
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('[AddModModal] Ошибка:', err);
      setError(err instanceof Error ? err.message : "Не удалось добавить мод.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-mod-title">
      <div className="modal-content add-mod-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="add-mod-title">Добавить мод</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <p className="form-error">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="mod-title">Название *</label>
            <input
              id="mod-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Название мода"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mod-description">Описание *</label>
            <textarea
              id="mod-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={3000}
              placeholder="Опишите ваш мод..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mod-version">Версия *</label>
            <select id="mod-version" value={version} onChange={(e) => setVersion(e.target.value)} required>
              {VERSIONS.map((v) => (
                <option key={v} value={v}>
                  {v === "java" ? "Java" : v === "bedrock" ? "Bedrock" : v === "java_bedrock" ? "Java + Bedrock" : v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mod-minecraft-version">Версия Minecraft</label>
            <input
              id="mod-minecraft-version"
              type="text"
              value={minecraftVersion}
              onChange={(e) => setMinecraftVersion(e.target.value)}
              maxLength={50}
              placeholder="Например: 1.20.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mod-image-file">Главное изображение (PNG/JPG) *</label>
            <input
              ref={imageInputRef}
              id="mod-image-file"
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={handleImageFileChange}
              required={!imageFile}
            />
            {imageFile && <p className="form-hint">Выбрано: {imageFile.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="mod-file">Файл мода (.jar/.zip) *</label>
            <input
              ref={modInputRef}
              id="mod-file"
              type="file"
              accept=".jar,.zip,application/java-archive,application/zip"
              onChange={handleModFileChange}
              required={!modFile}
            />
            {modFile && <p className="form-hint">Выбран: {modFile.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="mod-additional-images">Дополнительные изображения</label>
            <input
              ref={additionalImagesRef}
              id="mod-additional-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
            />
            {additionalImages.length > 0 && (
              <p className="form-hint">Выбрано: {additionalImages.length} дополнительных изображений</p>
            )}
            <p className="form-hint">Первое изображение будет превью</p>
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