"use client";

import { useState, useRef } from "react";
import { buildsApi } from "@/lib/api";

const DIFFICULTIES = ["легкая", "обычная", "сложная"] as const;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE_MB = 20;

type Material = { name: string; count: string };

type Props = { open: boolean; onClose: () => void; onSuccess?: () => void };

export function AddBuildModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [minecraftVersion, setMinecraftVersion] = useState("");
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTIES[0]);
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [buildFile, setBuildFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const buildInputRef = useRef<HTMLInputElement>(null);

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

  function handleBuildFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) {
      setBuildFile(null);
      return;
    }
    setBuildFile(f);
  }

  function handleAddMaterial() {
    setMaterials([...materials, { name: "", count: "" }]);
  }

  function handleRemoveMaterial(index: number) {
    setMaterials(materials.filter((_, i) => i !== index));
  }

  function handleMaterialChange(index: number, field: "name" | "count", value: string) {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Введите название постройки.");
      return;
    }
    if (!minecraftVersion.trim()) {
      setError("Введите версию Minecraft.");
      return;
    }
    if (!imageFile) {
      setError("Выберите изображение постройки (PNG/JPG).");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("minecraft_version", minecraftVersion.trim());
      formData.set("difficulty", difficulty);
      if (description.trim()) formData.set("description", description.trim());
      
      // Добавляем материалы как JSON
      const validMaterials = materials.filter(m => m.name.trim() && m.count.trim());
      if (validMaterials.length > 0) {
        formData.set("materials", JSON.stringify(validMaterials.map(m => ({
          name: m.name.trim(),
          count: parseInt(m.count, 10) || 0
        }))));
      }
      
      formData.set("image_file", imageFile);
      if (buildFile) {
        formData.set("build_file", buildFile);
      }

      console.log('[AddBuildModal] Отправка формы:', { 
        title, 
        minecraftVersion, 
        difficulty, 
        description: description.trim(), 
        materials: validMaterials,
        imageFileName: imageFile.name, 
        imageFileSize: imageFile.size,
        buildFileName: buildFile?.name 
      });

      const response = await buildsApi.create(formData);
      console.log('[AddBuildModal] Ответ сервера:', response);

      setTitle("");
      setMinecraftVersion("");
      setDifficulty(DIFFICULTIES[0]);
      setDescription("");
      setMaterials([]);
      setImageFile(null);
      setBuildFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (buildInputRef.current) buildInputRef.current.value = "";
      
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('[AddBuildModal] Ошибка:', err);
      setError(err instanceof Error ? err.message : "Не удалось добавить постройку.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="build-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-build-title">
      <div className="build-modal-content add-build-modal" onClick={(e) => e.stopPropagation()}>
        <div className="build-modal-header">
          <h2 id="add-build-title">Добавить постройку</h2>
          <button type="button" className="build-modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="build-modal-body">
          {error && <p className="build-form-error">{error}</p>}

          <div className="build-form-group">
            <label htmlFor="build-title">Название *</label>
            <input
              id="build-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Название постройки"
              required
            />
          </div>

          <div className="build-form-group">
            <label htmlFor="build-minecraft-version">Версия Minecraft *</label>
            <input
              id="build-minecraft-version"
              type="text"
              value={minecraftVersion}
              onChange={(e) => setMinecraftVersion(e.target.value)}
              maxLength={50}
              placeholder="Например: 1.20.1"
              required
            />
          </div>

          <div className="build-form-group">
            <label htmlFor="build-difficulty">Сложность *</label>
            <select id="build-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="build-form-group">
            <label htmlFor="build-description">Описание (необязательно)</label>
            <textarea
              id="build-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              placeholder="Опишите вашу постройку..."
              rows={3}
            />
          </div>

          <div className="build-form-group">
            <label>Материалы (необязательно)</label>
            <div className="materials-list">
              {materials.map((material, index) => (
                <div key={index} className="material-row">
                  <input
                    type="text"
                    placeholder="Название материала"
                    value={material.name}
                    onChange={(e) => handleMaterialChange(index, "name", e.target.value)}
                    className="material-name-input"
                  />
                  <input
                    type="text"
                    placeholder="Количество"
                    value={material.count}
                    onChange={(e) => handleMaterialChange(index, "count", e.target.value)}
                    className="material-count-input"
                  />
                  <button
                    type="button"
                    className="btn-remove-material"
                    onClick={() => handleRemoveMaterial(index)}
                    aria-label="Удалить материал"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-add-material" onClick={handleAddMaterial}>
              + Добавить материал
            </button>
          </div>

          <div className="build-form-group">
            <label htmlFor="build-image-file">Изображение (PNG/JPG) *</label>
            <input
              ref={imageInputRef}
              id="build-image-file"
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={handleImageFileChange}
              required={!imageFile}
            />
            {imageFile && <p className="build-form-hint">Выбран: {imageFile.name}</p>}
          </div>

          <div className="build-form-group">
            <label htmlFor="build-file">Файл постройки (необязательно)</label>
            <input
              ref={buildInputRef}
              id="build-file"
              type="file"
              accept=".zip,.rar,.schem,.litematic"
              onChange={handleBuildFileChange}
            />
            {buildFile && <p className="build-form-hint">Выбран: {buildFile.name}</p>}
          </div>

          <div className="build-modal-footer">
            <button type="button" className="build-btn-secondary-modal" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="build-btn-submit" disabled={submitting}>
              {submitting ? "Отправка…" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
