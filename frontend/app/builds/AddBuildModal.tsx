"use client";

import { useState, useRef } from "react";
import { buildsApi } from "@/lib/api";
import "./builds.css";

const ALLOWED_EXTENSIONS = [".nbt", ".schem", ".schematic"];
const MAX_SIZE_MB = 50;

type Material = {
  name: string;
  count: number;
};

type Props = { open: boolean; onClose: () => void; onSuccess?: () => void };

export function AddBuildModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minecraftVersion, setMinecraftVersion] = useState("");
  const [difficulty, setDifficulty] = useState("легкая");
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [materials, setMaterials] = useState<Material[]>([{ name: "", count: 1 }]);
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
      setError("Разрешены только файлы .nbt, .schem или .schematic");
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

  const addMaterial = () => {
    setMaterials([...materials, { name: "", count: 1 }]);
  };

  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const updateMaterial = (index: number, field: keyof Material, value: string | number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError("Введите название постройки.");
      return;
    }
    if (!file) {
      setError("Выберите файл постройки.");
      return;
    }

    // Фильтруем пустые материалы
    const validMaterials = materials.filter(m => m.name.trim() !== "" && m.count > 0);
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("description", description.trim());
      formData.set("minecraft_version", minecraftVersion);
      formData.set("difficulty", difficulty);
      formData.set("build_file", file);
      
      // Добавляем материалы как JSON строку
      formData.set("materials", JSON.stringify(validMaterials));
      
      images.forEach((img) => {
        formData.append("images[]", img);
      });
      
      await buildsApi.create(formData);
      
      setTitle("");
      setDescription("");
      setMinecraftVersion("");
      setDifficulty("легкая");
      setFile(null);
      setImages([]);
      setMaterials([{ name: "", count: 1 }]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imagesInputRef.current) imagesInputRef.current.value = "";
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось добавить постройку.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-build-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить постройку</h2>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <p className="form-error">{error}</p>}
          
          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Название постройки"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание постройки"
              rows={3}
            />
          </div>
          
          <div className="version-row">
            <div className="form-group">
              <label>Версия Minecraft</label>
              <input
                type="text"
                value={minecraftVersion}
                onChange={(e) => setMinecraftVersion(e.target.value)}
                placeholder="1.21.1"
              />
            </div>

            <div className="form-group">
              <label>Сложность *</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
                <option value="легкая">Легкая</option>
                <option value="обычная">Обычная</option>
                <option value="сложная">Сложная</option>
              </select>
            </div>
          </div>

          {/* Блок материалов */}
          <div className="form-group">
            <label>Необходимые материалы</label>
            <div className="materials-list">
              {materials.map((material, index) => (
                <div key={index} className="material-row">
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => updateMaterial(index, "name", e.target.value)}
                    placeholder="Название блока"
                    className="material-name"
                  />
                  <input
                    type="number"
                    value={material.count}
                    onChange={(e) => updateMaterial(index, "count", parseInt(e.target.value) || 1)}
                    min="1"
                    className="material-count"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeMaterial(index)}
                    className="material-remove"
                    disabled={materials.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addMaterial} className="material-add">
              + Добавить материал
            </button>
          </div>
          
          <div className="form-group">
            <label>Файл постройки *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".nbt,.schem,.schematic"
              onChange={handleFileChange}
              required={!file}
            />
            {file && <p className="form-hint">Выбран: {file.name}</p>}
          </div>
          
          <div className="form-group">
            <label>Изображения (можно несколько)</label>
            <input
              ref={imagesInputRef}
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
