"use client";

import { useState, useRef } from "react";
import { modsApi } from "@/lib/api";
import "./mods.css";

const VERSIONS = ["java", "bedrock", "forge", "fabric", "quilt"] as const;
const ALLOWED_EXTENSIONS = [".jar", ".zip"];
const MAX_SIZE_MB = 50;

type Props = { open: boolean; onClose: () => void; onSuccess?: () => void };

export function AddModModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState<string>(VERSIONS[0]);
  const [minecraftVersion, setMinecraftVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    
    const fileExt = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setError("Разрешены только файлы .jar или .zip");
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

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setError(null);
    
    const validImages: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        setError("Разрешены только изображения.");
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError("Размер изображения не более 5 МБ.");
        continue;
      }
      validImages.push(f);
    }
    
    setImages(validImages);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Введите название мода.");
      return;
    }
    if (!file) {
      setError("Выберите файл мода (.jar или .zip).");
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("description", description.trim());
      formData.set("version", version);
      formData.set("minecraft_version", minecraftVersion);
      formData.set("mod_file", file);
      
      images.forEach((img) => {
        formData.append("images[]", img);
      });
      
      await modsApi.create(formData);
      
      setTitle("");
      setDescription("");
      setVersion(VERSIONS[0]);
      setMinecraftVersion("");
      setFile(null);
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imagesInputRef.current) imagesInputRef.current.value = "";
      onClose();
      onSuccess?.();
    } catch (err) {
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
            <label htmlFor="mod-description">Описание</label>
            <textarea
              id="mod-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание мода"
              rows={4}
            />
          </div>
          
          <div className="version-row">
            <div className="form-group">
                <label htmlFor="mod-version">Версия мода *</label>
                <select id="mod-version" value={version} onChange={(e) => setVersion(e.target.value)} required>
                {VERSIONS.map((v) => (
                    <option key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
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
                placeholder="1.21.1"
                />
            </div>
            </div>
          
          <div className="form-group">
            <label htmlFor="mod-file">Файл мода (.jar или .zip) *</label>
            <input
              ref={fileInputRef}
              id="mod-file"
              type="file"
              accept=".jar,.zip,application/java-archive,application/zip"
              onChange={handleFileChange}
              required={!file}
            />
            {file && <p className="form-hint">Выбран: {file.name}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="mod-images">Изображения (можно несколько)</label>
            <input
              ref={imagesInputRef}
              id="mod-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
            />
            {images.length > 0 && (
              <p className="form-hint">Выбрано: {images.length} изображений</p>
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