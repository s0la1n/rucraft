"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

interface SkinCanvasProps {
  width?: number;
  height?: number;
  onSkinChange?: (imageData: ImageData) => void;
  initialImage?: string | null;
}

export interface SkinCanvasRef {
  getSkinDataURL: () => string;
  clearCanvas: () => void;
  loadTemplate: () => void;
}

export const SkinCanvas = forwardRef<SkinCanvasRef, SkinCanvasProps>(({ 
  width = 512, 
  height = 512, 
  onSkinChange, 
  initialImage 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(1);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  // Добавляем методы для ref
  useImperativeHandle(ref, () => ({
    getSkinDataURL: () => {
      if (!canvasRef.current) return "";
      return canvasRef.current.toDataURL("image/png");
    },
    clearCanvas: () => {
      clearCanvas();
    },
    loadTemplate: () => {
      loadTemplate();
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawGrid(ctx);
      };
      img.src = initialImage;
    } else {
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx);
    }
  }, [width, height, initialImage]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    const step = width / 64;
    
    for (let i = 0; i <= 64; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(width, i * step);
      ctx.stroke();
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return { x: Math.floor(x), y: Math.floor(y) };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current && onSkinChange) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, width, height);
        onSkinChange(imageData);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    ctx.fillStyle = color;
    ctx.fillRect(
      Math.floor(x / (width / 64)) * (width / 64),
      Math.floor(y / (height / 64)) * (height / 64),
      brushSize * (width / 64),
      brushSize * (height / 64)
    );

    drawGrid(ctx);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx);
    
    if (onSkinChange) {
      const imageData = ctx.getImageData(0, 0, width, height);
      onSkinChange(imageData);
    }
  };

  const loadTemplate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Создаем простой шаблон скина
    ctx.clearRect(0, 0, width, height);
    
    // Рисуем базовый скин (пример)
    ctx.fillStyle = "#8B4513"; // Коричневый для волос
    ctx.fillRect(8 * (width/64), 0 * (height/64), 16 * (width/64), 8 * (height/64));
    
    ctx.fillStyle = "#FFE4C4"; // Цвет кожи для лица
    ctx.fillRect(8 * (width/64), 8 * (height/64), 16 * (width/64), 8 * (height/64));
    
    ctx.fillStyle = "#0000FF"; // Синяя рубашка
    ctx.fillRect(16 * (width/64), 20 * (height/64), 8 * (width/64), 12 * (height/64));
    
    ctx.fillStyle = "#000080"; // Синие штаны
    ctx.fillRect(16 * (width/64), 36 * (height/64), 8 * (width/64), 12 * (height/64));
    
    drawGrid(ctx);
    
    if (onSkinChange) {
      const imageData = ctx.getImageData(0, 0, width, height);
      onSkinChange(imageData);
    }
  };

  const downloadSkin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "skin.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="skin-editor">
      <div className="skin-editor-toolbar">
        <div className="toolbar-group">
          <label>
            Цвет:
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
            />
          </label>
          
          <label>
            Размер кисти:
            <input 
              type="range" 
              min="1" 
              max="4" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))} 
            />
          </label>
        </div>

        <div className="toolbar-group">
          <label>
            Сетка:
            <input 
              type="checkbox" 
              checked={showGrid} 
              onChange={(e) => {
                setShowGrid(e.target.checked);
                const ctx = canvasRef.current?.getContext("2d");
                if (ctx && canvasRef.current) {
                  drawGrid(ctx);
                }
              }} 
            />
          </label>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={clearCanvas}>Очистить</button>
          <button type="button" onClick={loadTemplate}>Шаблон</button>
          <button type="button" onClick={downloadSkin}>Скачать</button>
        </div>
      </div>

      <div className="skin-canvas-container" style={{ overflow: "auto" }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ 
            width: width * zoom, 
            height: height * zoom,
            imageRendering: "pixelated",
            cursor: "crosshair"
          }}
        />
      </div>
    </div>
  );
});

SkinCanvas.displayName = "SkinCanvas";