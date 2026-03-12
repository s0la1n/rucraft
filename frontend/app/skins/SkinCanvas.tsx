"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

interface SkinCanvasProps {
  width?: number;
  height?: number;
  onSkinChange?: (imageData: ImageData) => void;
  initialImage?: string | null;
}

export interface SkinCanvasRef {
  getSkinDataURL: () => string;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
}

// Типы инструментов
type Tool = "brush" | "eraser" | "eyedropper" | "fill";

// Структура для хранения состояний скина (история)
interface SkinState {
  imageData: ImageData;
  dataURL: string;
}

// Яркие цвета для разных частей тела
const BODY_PART_COLORS = {
  // Голова - розовый
  head_top: "rgba(255, 100, 150, 0.4)",
  head_bottom: "rgba(255, 150, 100, 0.4)",
  head_right: "rgba(255, 100, 200, 0.4)",
  head_front: "rgba(255, 150, 150, 0.4)",
  head_left: "rgba(200, 100, 255, 0.4)",
  head_back: "rgba(150, 100, 255, 0.4)",
  
  // Правая нога - зеленый
  leg_right_top: "rgba(50, 200, 50, 0.4)",
  leg_right_bottom: "rgba(100, 150, 50, 0.4)",
  leg_right_side: "rgba(50, 200, 100, 0.4)",
  leg_right_front: "rgba(50, 200, 150, 0.4)",
  leg_right_left: "rgba(100, 200, 50, 0.4)",
  leg_right_back: "rgba(50, 150, 150, 0.4)",
  
  // Левая нога - светло-зеленый
  leg_left_top: "rgba(100, 255, 100, 0.4)",
  leg_left_bottom: "rgba(150, 200, 100, 0.4)",
  leg_left_side: "rgba(100, 255, 150, 0.4)",
  leg_left_front: "rgba(100, 255, 200, 0.4)",
  leg_left_left: "rgba(150, 255, 100, 0.4)",
  leg_left_back: "rgba(100, 200, 200, 0.4)",
  
  // Тело - красный
  body_bottom: "rgba(200, 50, 50, 0.4)",
  body_right: "rgba(200, 80, 80, 0.4)",
  body_front: "rgba(255, 50, 50, 0.4)",
  body_left: "rgba(200, 100, 100, 0.4)",
  body_back: "rgba(150, 50, 50, 0.4)",
  
  // Правая рука - синий
  arm_right_top: "rgba(50, 50, 200, 0.4)",
  arm_right_bottom: "rgba(50, 100, 200, 0.4)",
  arm_right_side: "rgba(80, 80, 255, 0.4)",
  arm_right_front: "rgba(50, 80, 255, 0.4)",
  arm_right_left: "rgba(100, 50, 200, 0.4)",
  arm_right_back: "rgba(50, 150, 200, 0.4)",
  
  // Левая рука - голубой
  arm_left_top: "rgba(100, 100, 255, 0.4)",
  arm_left_bottom: "rgba(100, 150, 255, 0.4)",
  arm_left_side: "rgba(150, 150, 255, 0.4)",
  arm_left_front: "rgba(100, 200, 255, 0.4)",
  arm_left_left: "rgba(150, 100, 255, 0.4)",
  arm_left_back: "rgba(100, 150, 255, 0.4)",
};

export const SkinCanvas = forwardRef<SkinCanvasRef, SkinCanvasProps>(
  ({ width = 512, height = 512, onSkinChange, initialImage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawingRef = useRef<boolean>(false);
    const lastDrawnRef = useRef<{ x: number; y: number } | null>(null);

    // Состояния
    const [currentTool, setCurrentTool] = useState<Tool>("brush");
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [showBodyParts, setShowBodyParts] = useState(true);
    const [hoverPosition, setHoverPosition] = useState<{
      gridX: number;
      gridY: number;
      part: string;
    } | null>(null);
    const [zoom, setZoom] = useState(1.5);

    // История изменений
    const [history, setHistory] = useState<SkinState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Инициализация canvas
    useEffect(() => {
      if (!canvasRef.current || !overlayCanvasRef.current) return;

      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctxRef.current = ctx;
      
      const overlayCanvas = overlayCanvasRef.current;
      overlayCanvas.width = width;
      overlayCanvas.height = height;
      
      const overlayCtx = overlayCanvas.getContext("2d");
      if (!overlayCtx) return;
      overlayCtxRef.current = overlayCtx;
      
      // Заливаем белым фоном
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      if (initialImage) {
        loadImageToCanvas(initialImage);
      } else {
        saveToHistory();
      }

      drawOverlay();
    }, [width, height]);

    const loadImageToCanvas = (imageUrl: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!ctxRef.current || !canvasRef.current) return;
        ctxRef.current.clearRect(0, 0, width, height);
        ctxRef.current.drawImage(img, 0, 0, width, height);
        drawOverlay();
        saveToHistory();
        
        if (onSkinChange) {
          const imageData = ctxRef.current.getImageData(0, 0, width, height);
          onSkinChange(imageData);
        }
      };
      img.src = imageUrl;
    };

    useEffect(() => {
      if (!initialImage || !ctxRef.current) return;
      loadImageToCanvas(initialImage);
    }, [initialImage]);

    // Рисование оверлея
    const drawOverlay = () => {
      if (!overlayCtxRef.current) return;
      
      const overlayCtx = overlayCtxRef.current;
      overlayCtx.clearRect(0, 0, width, height);
      
      if (showBodyParts) {
        drawBodyPartsOverlay(overlayCtx);
      }
      
      if (showGrid) {
        drawGrid(overlayCtx);
      }
    };

    // Рисование подсветки частей тела по новой развертке (без головного убора)
    const drawBodyPartsOverlay = (ctx: CanvasRenderingContext2D) => {
      const cell = width / 64;
      
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";
      
      // === ПЕРВЫЙ РЯД (Y: 0-8) ===
      // 0-8: Пусто
      
      // 8-16: Голова сверху
      ctx.fillStyle = BODY_PART_COLORS.head_top;
      ctx.fillRect(8 * cell, 0, 8 * cell, 8 * cell);
      ctx.strokeRect(8 * cell, 0, 8 * cell, 8 * cell);
      
      // 16-24: Голова снизу
      ctx.fillStyle = BODY_PART_COLORS.head_bottom;
      ctx.fillRect(16 * cell, 0, 8 * cell, 8 * cell);
      ctx.strokeRect(16 * cell, 0, 8 * cell, 8 * cell);
      
      // 24-64: Пусто (40 пикселей)
      
      // === ВТОРОЙ РЯД (Y: 8-16) ===
      // 0-8: Голова справа
      ctx.fillStyle = BODY_PART_COLORS.head_right;
      ctx.fillRect(0, 8 * cell, 8 * cell, 8 * cell);
      ctx.strokeRect(0, 8 * cell, 8 * cell, 8 * cell);
      
      // 8-16: Голова спереди
      ctx.fillStyle = BODY_PART_COLORS.head_front;
      ctx.fillRect(8 * cell, 8 * cell, 8 * cell, 8 * cell);
      ctx.strokeRect(8 * cell, 8 * cell, 8 * cell, 8 * cell);
      
      // 16-24: Голова слева
      ctx.fillStyle = BODY_PART_COLORS.head_left;
      ctx.fillRect(16 * cell, 8 * cell, 8 * cell, 8 * cell);
      ctx.strokeRect(16 * cell, 8 * cell, 8 * cell, 8 * cell);
      
      // 24-32: Голова сзади
      ctx.fillStyle = BODY_PART_COLORS.head_back;
      ctx.fillRect(24 * cell, 8 * cell, 8 * cell, 8 * cell);
      ctx.strokeRect(24 * cell, 8 * cell, 8 * cell, 8 * cell);
      
      // 32-64: Пусто (32 пикселя)
      
      // === ТРЕТИЙ РЯД (Y: 16-20) - ПРАВАЯ НОГА И РУКА ===
      // 0-4: Пусто
      
      // 4-8: Нога правая верх
      ctx.fillStyle = BODY_PART_COLORS.leg_right_top;
      ctx.fillRect(4 * cell, 16 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(4 * cell, 16 * cell, 4 * cell, 4 * cell);
      
      // 8-12: Нога правая стопа
      ctx.fillStyle = BODY_PART_COLORS.leg_right_bottom;
      ctx.fillRect(8 * cell, 16 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(8 * cell, 16 * cell, 4 * cell, 4 * cell);
      
      // 12-20: Пусто (8 пикселей)
      
      // 20-28: Тело снизу
      ctx.fillStyle = BODY_PART_COLORS.body_bottom;
      ctx.fillRect(20 * cell, 16 * cell, 8 * cell, 4 * cell);
      ctx.strokeRect(20 * cell, 16 * cell, 8 * cell, 4 * cell);
      
      // 28-36: Пусто (8 пикселей)
      
      // 36-40: Рука правая плечо
      ctx.fillStyle = BODY_PART_COLORS.arm_right_top;
      ctx.fillRect(36 * cell, 16 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(36 * cell, 16 * cell, 4 * cell, 4 * cell);
      
      // 40-44: Рука правая кулак
      ctx.fillStyle = BODY_PART_COLORS.arm_right_bottom;
      ctx.fillRect(40 * cell, 16 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(40 * cell, 16 * cell, 4 * cell, 4 * cell);
      
      // 44-64: Пусто (20 пикселей)
      
      // === ЧЕТВЕРТЫЙ РЯД (Y: 20-32) - ПРАВАЯ НОГА, ТЕЛО, ПРАВАЯ РУКА ===
      // 0-4: Нога правая справа
      ctx.fillStyle = BODY_PART_COLORS.leg_right_side;
      ctx.fillRect(0, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(0, 20 * cell, 4 * cell, 12 * cell);
      
      // 4-8: Нога правая спереди
      ctx.fillStyle = BODY_PART_COLORS.leg_right_front;
      ctx.fillRect(4 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(4 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 8-12: Нога правая слева
      ctx.fillStyle = BODY_PART_COLORS.leg_right_left;
      ctx.fillRect(8 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(8 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 12-16: Нога правая сзади
      ctx.fillStyle = BODY_PART_COLORS.leg_right_back;
      ctx.fillRect(12 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(12 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 16-20: Тело справа
      ctx.fillStyle = BODY_PART_COLORS.body_right;
      ctx.fillRect(16 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(16 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 20-28: Тело спереди
      ctx.fillStyle = BODY_PART_COLORS.body_front;
      ctx.fillRect(20 * cell, 20 * cell, 8 * cell, 12 * cell);
      ctx.strokeRect(20 * cell, 20 * cell, 8 * cell, 12 * cell);
      
      // 28-32: Тело слева
      ctx.fillStyle = BODY_PART_COLORS.body_left;
      ctx.fillRect(28 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(28 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 32-40: Спина
      ctx.fillStyle = BODY_PART_COLORS.body_back;
      ctx.fillRect(32 * cell, 20 * cell, 8 * cell, 12 * cell);
      ctx.strokeRect(32 * cell, 20 * cell, 8 * cell, 12 * cell);
      
      // 40-44: Рука правая справа
      ctx.fillStyle = BODY_PART_COLORS.arm_right_side;
      ctx.fillRect(40 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(40 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 44-48: Рука правая спереди
      ctx.fillStyle = BODY_PART_COLORS.arm_right_front;
      ctx.fillRect(44 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(44 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 48-52: Рука правая слева
      ctx.fillStyle = BODY_PART_COLORS.arm_right_left;
      ctx.fillRect(48 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(48 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 52-56: Рука правая сзади
      ctx.fillStyle = BODY_PART_COLORS.arm_right_back;
      ctx.fillRect(52 * cell, 20 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(52 * cell, 20 * cell, 4 * cell, 12 * cell);
      
      // 56-64: Пусто (8 пикселей)
      
      // === ПУСТОТА (Y: 32-48) ===
      // 0-64: Пусто - 16 пикселей высоты
      
      // === ПЯТЫЙ РЯД (Y: 48-52) - ЛЕВАЯ НОГА И РУКА ===
      // 20-24: Пусто (отступ)
      
      // 24-28: Нога левая верх
      ctx.fillStyle = BODY_PART_COLORS.leg_left_top;
      ctx.fillRect(24 * cell, 48 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(24 * cell, 48 * cell, 4 * cell, 4 * cell);
      
      // 28-32: Нога левая стопа
      ctx.fillStyle = BODY_PART_COLORS.leg_left_bottom;
      ctx.fillRect(28 * cell, 48 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(28 * cell, 48 * cell, 4 * cell, 4 * cell);
      
      // 32-40: Пусто (8 пикселей)
      
      // 40-44: Рука левая плечо
      ctx.fillStyle = BODY_PART_COLORS.arm_left_top;
      ctx.fillRect(40 * cell, 48 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(40 * cell, 48 * cell, 4 * cell, 4 * cell);
      
      // 44-48: Рука левая кулак
      ctx.fillStyle = BODY_PART_COLORS.arm_left_bottom;
      ctx.fillRect(44 * cell, 48 * cell, 4 * cell, 4 * cell);
      ctx.strokeRect(44 * cell, 48 * cell, 4 * cell, 4 * cell);
      
      // 48-64: Пусто (16 пикселей)
      
      // === ШЕСТОЙ РЯД (Y: 52-64) - ЛЕВАЯ НОГА И РУКА ===
      // 16-20: Нога левая справа
      ctx.fillStyle = BODY_PART_COLORS.leg_left_side;
      ctx.fillRect(16 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(16 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 20-24: Нога левая спереди
      ctx.fillStyle = BODY_PART_COLORS.leg_left_front;
      ctx.fillRect(20 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(20 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 24-28: Нога левая слева
      ctx.fillStyle = BODY_PART_COLORS.leg_left_left;
      ctx.fillRect(24 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(24 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 28-32: Нога левая сзади
      ctx.fillStyle = BODY_PART_COLORS.leg_left_back;
      ctx.fillRect(28 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(28 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 32-36: Пусто (4 пикселя)
      
      // 36-40: Рука левая спереди
      ctx.fillStyle = BODY_PART_COLORS.arm_left_front;
      ctx.fillRect(36 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(36 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 40-44: Рука левая слева
      ctx.fillStyle = BODY_PART_COLORS.arm_left_left;
      ctx.fillRect(40 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(40 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 44-48: Рука левая сзади
      ctx.fillStyle = BODY_PART_COLORS.arm_left_back;
      ctx.fillRect(44 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(44 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 48-52: Рука левая справа
      ctx.fillStyle = BODY_PART_COLORS.arm_left_side;
      ctx.fillRect(48 * cell, 52 * cell, 4 * cell, 12 * cell);
      ctx.strokeRect(48 * cell, 52 * cell, 4 * cell, 12 * cell);
      
      // 52-64: Пусто (12 пикселей)
      
      ctx.restore();
    };

    // Рисование сетки
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
      const step = width / 64;

      ctx.save();
      
      // Основные линии сетки
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= 64; i++) {
        ctx.beginPath();
        ctx.strokeStyle = i % 8 === 0 ? "#333" : "#999";
        ctx.lineWidth = i % 8 === 0 ? 1.5 : 0.5;
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, height);
        ctx.stroke();
      }

      for (let i = 0; i <= 64; i++) {
        ctx.beginPath();
        ctx.strokeStyle = i % 8 === 0 ? "#333" : "#999";
        ctx.lineWidth = i % 8 === 0 ? 1.5 : 0.5;
        ctx.moveTo(0, i * step);
        ctx.lineTo(width, i * step);
        ctx.stroke();
      }

      ctx.restore();
    };

    const getMouseCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      return {
        x: Math.floor((e.clientX - rect.left) * scaleX),
        y: Math.floor((e.clientY - rect.top) * scaleY),
      };
    };

    const drawPixel = (x: number, y: number) => {
      if (!ctxRef.current) return;

      const cellSize = width / 64;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);

      if (gridX < 0 || gridX >= 64 || gridY < 0 || gridY >= 64) return;

      const pixelX = gridX * cellSize;
      const pixelY = gridY * cellSize;
      const pixelSize = brushSize * cellSize;

      ctxRef.current.fillStyle = currentTool === "eraser" ? "#ffffff" : color;
      ctxRef.current.fillRect(pixelX, pixelY, pixelSize, pixelSize);
    };

    const handleDraw = (x: number, y: number) => {
      if (!ctxRef.current) return;

      const cellSize = width / 64;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);

      if (lastDrawnRef.current && 
          lastDrawnRef.current.x === gridX && 
          lastDrawnRef.current.y === gridY) {
        return;
      }

      drawPixel(x, y);
      lastDrawnRef.current = { x: gridX, y: gridY };
    };

    // Функция определения части тела по новой развертке (без головного убора)
    const getBodyPart = (gridX: number, gridY: number): string => {
      // Первый ряд (Y: 0-8)
      if (gridY >= 0 && gridY < 8) {
        if (gridX >= 8 && gridX < 16) return "👤 Голова (верх)";
        if (gridX >= 16 && gridX < 24) return "👤 Голова (низ)";
      }
      
      // Второй ряд (Y: 8-16)
      if (gridY >= 8 && gridY < 16) {
        if (gridX >= 0 && gridX < 8) return "👤 Голова (правая)";
        if (gridX >= 8 && gridX < 16) return "👤 Голова (перед)";
        if (gridX >= 16 && gridX < 24) return "👤 Голова (левая)";
        if (gridX >= 24 && gridX < 32) return "👤 Голова (зад)";
      }

      // Третий ряд (Y: 16-20) - правая нога и рука верх
      if (gridY >= 16 && gridY < 20) {
        if (gridX >= 4 && gridX < 8) return "🦵 Правая нога (верх)";
        if (gridX >= 8 && gridX < 12) return "🦵 Правая нога (стопа)";
        if (gridX >= 20 && gridX < 28) return "👕 Тело (низ)";
        if (gridX >= 36 && gridX < 40) return "✋ Правая рука (плечо)";
        if (gridX >= 40 && gridX < 44) return "✋ Правая рука (кулак)";
      }

      // Четвертый ряд (Y: 20-32) - правая нога, тело, правая рука
      if (gridY >= 20 && gridY < 32) {
        if (gridX >= 0 && gridX < 4) return "🦵 Правая нога (правая)";
        if (gridX >= 4 && gridX < 8) return "🦵 Правая нога (перед)";
        if (gridX >= 8 && gridX < 12) return "🦵 Правая нога (левая)";
        if (gridX >= 12 && gridX < 16) return "🦵 Правая нога (зад)";
        if (gridX >= 16 && gridX < 20) return "👕 Тело (правая)";
        if (gridX >= 20 && gridX < 28) return "👕 Тело (перед)";
        if (gridX >= 28 && gridX < 32) return "👕 Тело (левая)";
        if (gridX >= 32 && gridX < 40) return "👕 Спина";
        if (gridX >= 40 && gridX < 44) return "✋ Правая рука (правая)";
        if (gridX >= 44 && gridX < 48) return "✋ Правая рука (перед)";
        if (gridX >= 48 && gridX < 52) return "✋ Правая рука (левая)";
        if (gridX >= 52 && gridX < 56) return "✋ Правая рука (зад)";
      }

      // Пустота (Y: 32-48)
      if (gridY >= 32 && gridY < 48) {
        return "⬜ Пусто";
      }

      // Пятый ряд (Y: 48-52) - левая нога и рука верх
      if (gridY >= 48 && gridY < 52) {
        if (gridX >= 24 && gridX < 28) return "🦵 Левая нога (верх)";
        if (gridX >= 28 && gridX < 32) return "🦵 Левая нога (стопа)";
        if (gridX >= 40 && gridX < 44) return "✋ Левая рука (плечо)";
        if (gridX >= 44 && gridX < 48) return "✋ Левая рука (кулак)";
      }

      // Шестой ряд (Y: 52-64) - левая нога и рука
      if (gridY >= 52 && gridY < 64) {
        if (gridX >= 16 && gridX < 20) return "🦵 Левая нога (правая)";
        if (gridX >= 20 && gridX < 24) return "🦵 Левая нога (перед)";
        if (gridX >= 24 && gridX < 28) return "🦵 Левая нога (левая)";
        if (gridX >= 28 && gridX < 32) return "🦵 Левая нога (зад)";
        if (gridX >= 36 && gridX < 40) return "✋ Левая рука (перед)";
        if (gridX >= 40 && gridX < 44) return "✋ Левая рука (левая)";
        if (gridX >= 44 && gridX < 48) return "✋ Левая рука (зад)";
        if (gridX >= 48 && gridX < 52) return "✋ Левая рука (правая)";
      }

      return "⬜ Пусто";
    };

    const saveToHistory = () => {
      if (!ctxRef.current || !canvasRef.current) return;

      const imageData = ctxRef.current.getImageData(0, 0, width, height);
      const dataURL = canvasRef.current.toDataURL("image/png");

      const newState: SkinState = { imageData, dataURL };
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);

      if (newHistory.length > 20) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
      if (historyIndex > 0 && ctxRef.current) {
        const newIndex = historyIndex - 1;
        const state = history[newIndex];
        ctxRef.current.putImageData(state.imageData, 0, 0);
        drawOverlay();
        setHistoryIndex(newIndex);
        
        if (onSkinChange) {
          onSkinChange(state.imageData);
        }
      }
    };

    const redo = () => {
      if (historyIndex < history.length - 1 && ctxRef.current) {
        const newIndex = historyIndex + 1;
        const state = history[newIndex];
        ctxRef.current.putImageData(state.imageData, 0, 0);
        drawOverlay();
        setHistoryIndex(newIndex);
        
        if (onSkinChange) {
          onSkinChange(state.imageData);
        }
      }
    };

    const pickColor = (x: number, y: number) => {
      if (!ctxRef.current) return;

      const pixelData = ctxRef.current.getImageData(x, y, 1, 1).data;
      const hexColor = `#${(
        (1 << 24) +
        (pixelData[0] << 16) +
        (pixelData[1] << 8) +
        pixelData[2]
      )
        .toString(16)
        .slice(1)}`;
      setColor(hexColor);
      setCurrentTool("brush");
    };

    const fill = (x: number, y: number) => {
      if (!ctxRef.current) return;

      const cellSize = width / 64;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);

      ctxRef.current.fillStyle = color;
      ctxRef.current.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
      drawOverlay();
      saveToHistory();

      if (onSkinChange) {
        const imageData = ctxRef.current.getImageData(0, 0, width, height);
        onSkinChange(imageData);
      }
    };

    useImperativeHandle(ref, () => ({
      getSkinDataURL: () => {
        if (!canvasRef.current) return "";
        return canvasRef.current.toDataURL("image/png");
      },
      clearCanvas: () => {
        if (!ctxRef.current || !canvasRef.current) return;
        ctxRef.current.fillStyle = "#ffffff";
        ctxRef.current.fillRect(0, 0, width, height);
        drawOverlay();
        saveToHistory();
        
        if (onSkinChange) {
          const imageData = ctxRef.current.getImageData(0, 0, width, height);
          onSkinChange(imageData);
        }
      },
      undo,
      redo,
    }));

    useEffect(() => {
      drawOverlay();
    }, [showGrid, showBodyParts]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      isDrawingRef.current = true;
      lastDrawnRef.current = null;
      
      const { x, y } = getMouseCoordinates(e);

      if (currentTool === "eyedropper") {
        pickColor(x, y);
      } else if (currentTool === "fill") {
        fill(x, y);
      } else {
        handleDraw(x, y);
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getMouseCoordinates(e);

      const cellSize = width / 64;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);
      const part = getBodyPart(gridX, gridY);
      setHoverPosition({ gridX, gridY, part });

      if (isDrawingRef.current && currentTool !== "eyedropper" && currentTool !== "fill") {
        handleDraw(x, y);
      }
    };

    const handleMouseUp = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        lastDrawnRef.current = null;
        saveToHistory();

        if (onSkinChange && ctxRef.current) {
          const imageData = ctxRef.current.getImageData(0, 0, width, height);
          onSkinChange(imageData);
        }
      }
    };

    const handleMouseLeave = () => {
      setHoverPosition(null);
      if (isDrawingRef.current) {
        handleMouseUp();
      }
    };

    return (
      <div className="skin-editor" style={{ maxWidth: "100%", overflow: "hidden" }}>
        {/* Панель инструментов */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            padding: "10px",
            background: "#f5f5f5",
            borderRadius: "8px",
            marginBottom: "10px",
            flexWrap: "wrap",
            alignItems: "center",
            overflowX: "auto",
            maxWidth: "100%",
          }}
        >
          {/* Инструменты */}
          <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setCurrentTool("brush")}
              style={{
                padding: "6px 12px",
                background: currentTool === "brush" ? "#007bff" : "#fff",
                color: currentTool === "brush" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ✏️ Кисть
            </button>
            <button
              onClick={() => setCurrentTool("eraser")}
              style={{
                padding: "6px 12px",
                background: currentTool === "eraser" ? "#007bff" : "#fff",
                color: currentTool === "eraser" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🧽 Ластик
            </button>
            <button
              onClick={() => setCurrentTool("eyedropper")}
              style={{
                padding: "6px 12px",
                background: currentTool === "eyedropper" ? "#007bff" : "#fff",
                color: currentTool === "eyedropper" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🎯 Пипетка
            </button>
            <button
              onClick={() => setCurrentTool("fill")}
              style={{
                padding: "6px 12px",
                background: currentTool === "fill" ? "#007bff" : "#fff",
                color: currentTool === "fill" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🪣 Заливка
            </button>
          </div>

          {/* Цвет и размер */}
          <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
              🎨 Цвет:
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: "40px", height: "30px" }}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
              ✏️ Размер:
              <select
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                style={{ padding: "4px" }}
              >
                <option value="1">1x1</option>
                <option value="2">2x2</option>
                <option value="3">3x3</option>
                <option value="4">4x4</option>
              </select>
            </label>
          </div>

          {/* Опции */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              🔲 Сетка
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={showBodyParts}
                onChange={(e) => setShowBodyParts(e.target.checked)}
              />
              🎨 Части тела
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
              🔍 Зум:
              <select
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ padding: "4px" }}
              >
                <option value="1">100%</option>
                <option value="1.5">150%</option>
                <option value="2">200%</option>
                <option value="3">300%</option>
              </select>
            </label>
          </div>

          {/* История */}
          <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              style={{
                padding: "6px 12px",
                cursor: historyIndex <= 0 ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ↩️ Отмена
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              style={{
                padding: "6px 12px",
                cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ↪️ Повтор
            </button>
          </div>

          {/* Действия */}
          <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                if (ctxRef.current && canvasRef.current) {
                  ctxRef.current.fillStyle = "#ffffff";
                  ctxRef.current.fillRect(0, 0, width, height);
                  drawOverlay();
                  saveToHistory();
                  
                  if (onSkinChange) {
                    const imageData = ctxRef.current.getImageData(0, 0, width, height);
                    onSkinChange(imageData);
                  }
                }
              }}
              style={{ padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              🗑️ Очистить
            </button>
            <button
              onClick={() => {
                if (canvasRef.current) {
                  const link = document.createElement("a");
                  link.download = "skin.png";
                  link.href = canvasRef.current.toDataURL("image/png");
                  link.click();
                }
              }}
              style={{ padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              💾 Скачать
            </button>
          </div>

          {/* Позиция */}
          {hoverPosition && (
            <div
              style={{
                background: "#e0e0e0",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                marginLeft: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {hoverPosition.part} [{hoverPosition.gridX}, {hoverPosition.gridY}]
            </div>
          )}
        </div>

        {/* Контейнер для канваса */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            overflow: "auto",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#fff",
            maxHeight: "70vh",
          }}
        >
          <div style={{ 
            minWidth: "fit-content", 
            minHeight: "fit-content",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
          }}>
            <div style={{ position: "relative" }}>
              <canvas
                ref={canvasRef}
                style={{
                  display: "block",
                  width: width * zoom,
                  height: height * zoom,
                  imageRendering: "pixelated",
                  cursor: currentTool === "eyedropper" ? "copy" : "crosshair",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              />
              
              <canvas
                ref={overlayCanvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  display: "block",
                  width: width * zoom,
                  height: height * zoom,
                  imageRendering: "pixelated",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Легенда */}
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#f9f9f9",
            borderRadius: "6px",
            fontSize: "12px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "8px",
            border: "1px solid #eee",
            maxHeight: "150px",
            overflowY: "auto",
          }}
        >
          <div><span style={{ background: BODY_PART_COLORS.head_top, display: "inline-block", width: "12px", height: "12px", border: "1px solid #000" }}></span> Голова</div>
          <div><span style={{ background: BODY_PART_COLORS.body_front, display: "inline-block", width: "12px", height: "12px", border: "1px solid #000" }}></span> Тело</div>
          <div><span style={{ background: BODY_PART_COLORS.body_back, display: "inline-block", width: "12px", height: "12px", border: "1px solid #000" }}></span> Спина</div>
          <div><span style={{ background: BODY_PART_COLORS.leg_right_front, display: "inline-block", width: "12px", height: "12px", border: "1px solid #000" }}></span> Правая нога</div>
          <div><span style={{ background: BODY_PART_COLORS.leg_left_front, display: "inline-block", width: "12px", height: "12px", border: "1px solid #000" }}></span> Левая нога</div>
          <div><span style={{ background: BODY_PART_COLORS.arm_right_front, display: "inline-block", width: "12px", height: "12px", border: "1px solid #000" }}></span> Правая рука</div>
          <div><span style={{ background: BODY_PART_COLORS.arm_left_front, display: "inline-block", width: "12px", height: "12px", border: "1px solid #000" }}></span> Левая рука</div>
        </div>
      </div>
    );
  }
);

SkinCanvas.displayName = "SkinCanvas";