"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SkinCanvas, SkinCanvasRef } from "../SkinCanvas";
import { Skin3DViewer } from "../Skin3DViewer";
import { skinsApi } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";

const CATEGORIES = ["Смешные", "Для девочек", "Для мальчиков", "Аниме", "Мобы", "Милые", "Ютуберы"] as const;
const MODELS = ["Steve", "Alex"] as const;

export default function CreateSkinPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [model, setModel] = useState<string>(MODELS[0]);
  const [skinDataURL, setSkinDataURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"2d" | "3d">("3d");
  
  // Исправлено: используем правильный тип ref
  const canvasRef = useRef<SkinCanvasRef>(null);

  const handleSkinChange = (imageData: ImageData) => {
    // Конвертируем ImageData в data URL для предпросмотра
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
      setSkinDataURL(canvas.toDataURL("image/png"));
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("Необходимо авторизоваться");
      return;
    }

    if (!title.trim()) {
      setError("Введите название скина");
      return;
    }

    // Используем метод из ref для получения dataURL
    const dataURL = canvasRef.current?.getSkinDataURL();
    if (!dataURL) {
      setError("Сначала нарисуйте скин");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Конвертируем data URL в File
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const file = new File([blob], "skin.png", { type: "image/png" });

      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("category", category);
      formData.set("model", model);
      formData.set("skin_file", file);

      await skinsApi.create(formData);
      router.push("/skins?created=true");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить скин");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadTemplate = () => {
    canvasRef.current?.loadTemplate();
  };

  if (!user) {
    return (
      <div className="page-content">
        <div className="skins-list-page" style={{ paddingTop: "24px" }}>
          <h1>Создать скин</h1>
          <div className="alert alert-warning">
            <p>Для создания скинов необходимо <Link href="/login">войти в систему</Link>.</p>
          </div>
          <p>
            <Link href="/skins" className="skins-action-btn" style={{ display: "inline-flex" }}>
              ← Назад к скинам
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="skin-creator">
        <div className="skin-creator-header">
          <h1>Создать скин</h1>
          <Link href="/skins" className="skins-action-btn">
            ← Назад к скинам
          </Link>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="skin-creator-layout">
          {/* Левая колонка - редактор */}
          <div className="skin-editor-section">
            <div className="skin-editor-toolbar">
              <div className="toolbar-group">
                <button 
                  type="button" 
                  onClick={handleLoadTemplate}
                  className="btn-secondary"
                >
                  Загрузить шаблон
                </button>
              </div>

              <div className="toolbar-group">
                <label>
                  Название:
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Название скина"
                    maxLength={255}
                  />
                </label>
              </div>

              <div className="toolbar-group">
                <label>
                  Категория:
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Модель:
                  <select value={model} onChange={(e) => setModel(e.target.value)}>
                    {MODELS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Исправлено: убираем ref из пропсов, используем правильный способ */}
            <SkinCanvas 
              ref={canvasRef}
              onSkinChange={handleSkinChange}
              initialImage={skinDataURL}
              width={512}
              height={512}
            />
          </div>

          {/* Правая колонка - предпросмотр */}
          <div className="skin-preview-section">
            <div className="preview-header">
              <h2>Предпросмотр</h2>
              <div className="preview-tabs">
                <button
                  className={`preview-tab ${previewMode === "3d" ? "active" : ""}`}
                  onClick={() => setPreviewMode("3d")}
                >
                  3D
                </button>
                <button
                  className={`preview-tab ${previewMode === "2d" ? "active" : ""}`}
                  onClick={() => setPreviewMode("2d")}
                >
                  2D
                </button>
              </div>
            </div>

            <div className="preview-container">
              {previewMode === "3d" ? (
                <div className="preview-3d">
                  <Skin3DViewer 
                    skinDataURL={skinDataURL}
                    title={title || "Новый скин"}
                    autoRotate={true}
                    width={400}
                    height={400}
                  />
                </div>
              ) : (
                <div className="preview-2d">
                  {skinDataURL ? (
                    <img 
                      src={skinDataURL} 
                      alt="2D preview" 
                      style={{ 
                        width: "100%", 
                        imageRendering: "pixelated",
                        border: "1px solid #ddd"
                      }} 
                    />
                  ) : (
                    <div className="preview-placeholder">
                      Нарисуйте скин для предпросмотра
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="preview-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={isSubmitting || !skinDataURL}
              >
                {isSubmitting ? "Сохранение..." : "Сохранить скин"}
              </button>
            </div>
          </div>
        </div>

        <div className="skin-creator-info">
          <h3>Как рисовать скин:</h3>
          <ul>
            <li>Используйте сетку для точного рисования пикселей</li>
            <li>Выбирайте цвет и размер кисти</li>
            <li>В 3D предпросмотре скин вращается автоматически</li>
            <li>Сохраните скин, чтобы поделиться им с другими</li>
          </ul>
        </div>
      </div>
    </div>
  );
}