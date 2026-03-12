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
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"2d" | "3d">("3d");
  
  const canvasRef = useRef<SkinCanvasRef>(null);

  const handleSkinChange = (imageData: ImageData) => {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
      setSkinDataURL(canvas.toDataURL("image/png"));
    }
  };

  const handleSubmitForReview = async () => {
    if (!user) {
      setError("Необходимо авторизоваться");
      return;
    }

    if (!title.trim()) {
      setError("Введите название скина");
      return;
    }

    const dataURL = canvasRef.current?.getSkinDataURL();
    if (!dataURL) {
      setError("Сначала нарисуйте скин");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const file = new File([blob], "skin.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("model", model);
      formData.append("skin_file", file);

      const result = await skinsApi.submitForReview(formData);
      
      setSuccess("Скин успешно отправлен на рассмотрение! Администратор проверит его в ближайшее время.");
      
      // Очищаем форму после успешной отправки
      setTitle("");
      
      // Через 3 секунды перенаправляем на страницу со скинами
      setTimeout(() => {
        router.push("/skins?submitted=true");
        router.refresh();
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить скин на рассмотрение");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="alert alert-error" style={{ 
            background: "#fee", 
            border: "1px solid #f99",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
            color: "#c00"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ 
            background: "#efe", 
            border: "1px solid #9f9",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
            color: "#090"
          }}>
            {success}
          </div>
        )}

        <div className="skin-creator-layout">
          {/* Левая колонка - редактор */}
          <div className="skin-editor-section">
            <div className="skin-editor-toolbar" style={{ 
              display: "flex", 
              gap: "16px", 
              marginBottom: "16px",
              flexWrap: "wrap",
              alignItems: "center"
            }}>
              <div className="toolbar-group" style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
                  Название скина:
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название"
                    maxLength={255}
                    style={{ 
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      marginTop: "4px"
                    }}
                  />
                </label>
              </div>

              <div className="toolbar-group" style={{ display: "flex", gap: "12px" }}>
                <label>
                  <span style={{ fontWeight: "bold" }}>Категория:</span>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ 
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      marginLeft: "8px"
                    }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span style={{ fontWeight: "bold" }}>Модель:</span>
                  <select 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    style={{ 
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      marginLeft: "8px"
                    }}
                  >
                    {MODELS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <SkinCanvas 
              ref={canvasRef}
              onSkinChange={handleSkinChange}
              initialImage={skinDataURL}
              width={512}
              height={512}
            />
          </div>

          {/* Правая колонка - предпросмотр */}
          <div className="skin-preview-section" style={{ 
            width: "400px",
            marginLeft: "24px"
          }}>
            <div className="preview-header" style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <h2 style={{ margin: 0 }}>Предпросмотр</h2>
              <div className="preview-tabs" style={{ display: "flex", gap: "4px" }}>
                <button
                  className={`preview-tab ${previewMode === "3d" ? "active" : ""}`}
                  onClick={() => setPreviewMode("3d")}
                  style={{
                    padding: "6px 12px",
                    background: previewMode === "3d" ? "#007bff" : "#f0f0f0",
                    color: previewMode === "3d" ? "#fff" : "#000",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  3D
                </button>
                <button
                  className={`preview-tab ${previewMode === "2d" ? "active" : ""}`}
                  onClick={() => setPreviewMode("2d")}
                  style={{
                    padding: "6px 12px",
                    background: previewMode === "2d" ? "#007bff" : "#f0f0f0",
                    color: previewMode === "2d" ? "#fff" : "#000",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  2D
                </button>
              </div>
            </div>

            <div className="preview-container" style={{ 
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px"
            }}>
              {previewMode === "3d" ? (
                <div className="preview-3d" style={{ height: "400px" }}>
                  <Skin3DViewer 
                    skinDataURL={skinDataURL}
                    title={title || "Новый скин"}
                    autoRotate={true}
                    width={400}
                    height={400}
                  />
                </div>
              ) : (
                <div className="preview-2d" style={{ textAlign: "center" }}>
                  {skinDataURL ? (
                    <img 
                      src={skinDataURL} 
                      alt="2D preview" 
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "400px",
                        imageRendering: "pixelated",
                        border: "1px solid #ddd",
                        background: "#fff"
                      }} 
                    />
                  ) : (
                    <div className="preview-placeholder" style={{ 
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999"
                    }}>
                      Нарисуйте скин для предпросмотра
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="preview-actions" style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitForReview}
                disabled={isSubmitting || !skinDataURL}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: isSubmitting || !skinDataURL ? "#ccc" : "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: isSubmitting || !skinDataURL ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? "Отправка..." : "📨 Отправить на рассмотрение"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (canvasRef.current) {
                    canvasRef.current.clearCanvas();
                    setSkinDataURL(null);
                  }
                }}
                style={{
                  padding: "12px 20px",
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                🗑️ Очистить
              </button>
            </div>

            <div className="info-note" style={{
              marginTop: "16px",
              padding: "12px",
              background: "#e7f3ff",
              border: "1px solid #b8daff",
              borderRadius: "4px",
              fontSize: "14px",
              color: "#004085"
            }}>
              <strong>ℹ️ Как это работает:</strong>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                <li>После отправки скин будет проверен администратором</li>
                <li>Статус скина изменится с "process" на "active" после одобрения</li>
                <li>Вы получите уведомление о результате проверки</li>
                <li>Одобренные скины появятся в общем доступе</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="skin-creator-info" style={{
          marginTop: "24px",
          padding: "16px",
          background: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #eee"
        }}>
          <h3 style={{ marginTop: 0 }}>Как рисовать скин:</h3>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>Используйте сетку для точного рисования пикселей</li>
            <li>Выбирайте цвет и размер кисти в панели инструментов</li>
            <li>В 3D предпросмотре скин вращается автоматически</li>
            <li>После завершения нажмите "Отправить на рассмотрение"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}