"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const SKIN_SIZE = 64;
const SCALE = 6;
const DEFAULT_FILL = "#8b6914";

export default function CreateSkinPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#8b6914");
  const [drawing, setDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const updatePreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setPreviewDataUrl(canvas.toDataURL("image/png"));
    } catch {
      setPreviewDataUrl(null);
    }
  }, []);

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = SKIN_SIZE;
    canvas.height = SKIN_SIZE;
    ctx.fillStyle = DEFAULT_FILL;
    ctx.fillRect(0, 0, SKIN_SIZE, SKIN_SIZE);
    updatePreview();
  }, [updatePreview]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = SKIN_SIZE / rect.width;
    const scaleY = SKIN_SIZE / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  };

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      const { x, y } = getCoords(e);
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.max(0, x - brushSize),
        Math.max(0, y - brushSize),
        brushSize * 2 + 1,
        brushSize * 2 + 1
      );
      updatePreview();
    },
    [color, brushSize, updatePreview]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    draw(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawing) draw(e);
  };

  const handleMouseUp = () => setDrawing(false);
  const handleMouseLeave = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = DEFAULT_FILL;
    ctx.fillRect(0, 0, SKIN_SIZE, SKIN_SIZE);
    updatePreview();
  };

  const downloadSkin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "skin.png";
    a.click();
  };

  return (
    <div className="page-content">
      <div className="skin-editor-header">
        <h1 className="skin-editor-title">Создать скин</h1>
        <Link href="/skins" className="skins-action-btn">
          ← Назад к скинам
        </Link>
      </div>

      <p className="skin-editor-desc">
        Нарисуйте скин на холсте (64×64). Слева — редактор, справа — превью на развёртке.
      </p>

      <div className="skin-editor-layout">
        <div className="skin-editor-tools">
          <div className="skin-editor-section">
            <label>Цвет</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="skin-editor-color"
            />
          </div>
          <div className="skin-editor-section">
            <label>Кисть: {brushSize}px</label>
            <input
              type="range"
              min={1}
              max={4}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="skin-editor-range"
            />
          </div>
          <div className="skin-editor-buttons">
            <button type="button" onClick={clearCanvas} className="btn-secondary">
              Очистить
            </button>
            <button type="button" onClick={downloadSkin} className="btn-submit">
              Скачать скин (PNG)
            </button>
          </div>
        </div>

        <div className="skin-editor-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={SKIN_SIZE}
            height={SKIN_SIZE}
            className="skin-editor-canvas"
            style={{ width: SKIN_SIZE * SCALE, height: SKIN_SIZE * SCALE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        <div className="skin-editor-preview">
          <p className="skin-editor-preview-title">Превью развёртки</p>
          {previewDataUrl ? (
            <img
              src={previewDataUrl}
              alt="Превью скина"
              className="skin-editor-preview-img"
              width={SKIN_SIZE * 4}
              height={SKIN_SIZE * 4}
            />
          ) : (
            <div className="skin-editor-preview-placeholder">Загрузка…</div>
          )}
          <p className="skin-editor-hint">
            Стандартная развёртка скина Minecraft 64×64. Сохраните PNG и загрузите через «Добавить» на странице скинов.
          </p>
        </div>
      </div>
    </div>
  );
}
