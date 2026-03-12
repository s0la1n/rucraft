// app/skins/Skin3DViewer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { resolveAssetUrl } from "@/lib/api";

interface Skin3DViewerProps {
  skinUrl?: string | null;
  title: string;
  className?: string;
}

export function Skin3DViewer({ skinUrl, title, className }: Skin3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Отладка
    console.log(`[SKIN_DEBUG] ${title}:`, {
      skinUrl,
      type: typeof skinUrl,
      isNull: skinUrl === null,
    });
    
    // Если нет контейнера - выходим
    if (!containerRef.current) return;

    // Получаем правильный URL через resolveAssetUrl
    let resolvedUrl: string | null = null;
    
    try {
      // БЕЗОПАСНО: проверяем skinUrl перед использованием
      if (skinUrl === null || skinUrl === undefined) {
        console.log(`[Skin3DViewer] No skin URL for ${title}`);
        setError('Нет URL скина');
        showPlaceholder(containerRef.current, title);
        return;
      }

      // Проверяем тип
      if (typeof skinUrl !== 'string') {
        console.log(`[Skin3DViewer] Invalid skin URL type for ${title}:`, typeof skinUrl);
        setError('Неверный тип URL');
        showPlaceholder(containerRef.current, title);
        return;
      }

      // Только теперь безопасно вызываем trim()
      const trimmedUrl = skinUrl.trim();
      if (!trimmedUrl || trimmedUrl === 'null' || trimmedUrl === 'undefined') {
        console.log(`[Skin3DViewer] Empty skin URL for ${title}`);
        setError('Пустой URL');
        showPlaceholder(containerRef.current, title);
        return;
      }

      // Получаем финальный URL через resolveAssetUrl
      resolvedUrl = resolveAssetUrl(trimmedUrl);
      
      console.log(`[Skin3DViewer] Resolved URL for ${title}:`, resolvedUrl);
      
      if (!resolvedUrl) {
        console.log(`[Skin3DViewer] Could not resolve URL for ${title}:`, trimmedUrl);
        setError('Не удалось преобразовать URL');
        showPlaceholder(containerRef.current, title);
        return;
      }

      console.log(`[Skin3DViewer] Loading skin for ${title}:`, resolvedUrl);
      
    } catch (err) {
      console.error(`[Skin3DViewer] Error processing URL for ${title}:`, err);
      setError('Ошибка обработки URL');
      showPlaceholder(containerRef.current, title);
      return;
    }

    // Если дошли до сюда, значит resolvedUrl есть
    let disposed = false;

    const initViewer = async () => {
      try {
        // Очищаем предыдущий viewer
        if (viewerRef.current) {
          try {
            if (typeof viewerRef.current.dispose === 'function') {
              viewerRef.current.dispose();
            }
          } catch (e) {
            // Игнорируем
          }
          viewerRef.current = null;
        }

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }

        const skinview3d = await import("skinview3d");
        
        if (disposed || !containerRef.current) return;

        // Очищаем контейнер
        containerRef.current.innerHTML = "";
        
        // Создаем canvas
        const canvas = document.createElement("canvas");
        canvas.width = containerRef.current.clientWidth || 220;
        canvas.height = containerRef.current.clientHeight || 260;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        
        containerRef.current.appendChild(canvas);

        // Создаем viewer
        const viewer = new skinview3d.SkinViewer({
          canvas: canvas,
          width: canvas.width,
          height: canvas.height
        });

        viewerRef.current = viewer;
        
        // Настройки
        if (typeof viewer.zoom !== 'undefined') {
          viewer.zoom = 0.9;
        }
        
        if (typeof viewer.autoRotate !== 'undefined') {
          viewer.autoRotate = true;
        }
        
        if (viewer.playerObject) {
          viewer.playerObject.rotation.y = Math.PI / 4;
        }

        // Загружаем скин с обработкой ошибок
        try {
          await viewer.loadSkin(resolvedUrl!);
          setError(null);
          console.log(`[Skin3DViewer] Successfully loaded skin for ${title}`);
        } catch (loadError) {
          console.warn(`[Skin3DViewer] Failed to load skin for ${title}:`, loadError);
          setError('Ошибка загрузки текстуры');
          showPlaceholder(containerRef.current, title);
        }

        // Анимация
        const animate = () => {
          if (!disposed && viewerRef.current) {
            try {
              if (typeof viewerRef.current.render === 'function') {
                viewerRef.current.render();
              }
            } catch (renderError) {
              console.warn('Render error:', renderError);
            }
            animationRef.current = requestAnimationFrame(animate);
          }
        };
        
        animate();

      } catch (error) {
        console.error('Error initializing skinview3d:', error);
        setError('Ошибка инициализации 3D');
        if (containerRef.current && !disposed) {
          showPlaceholder(containerRef.current, title);
        }
      }
    };

    initViewer();

    // Функция для показа плейсхолдера
    function showPlaceholder(container: HTMLDivElement, text: string) {
      if (disposed) return;
      container.innerHTML = `<div class="skin-card-canvas-placeholder">${text}</div>`;
    }

    return () => {
      disposed = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      if (viewerRef.current) {
        try {
          if (typeof viewerRef.current.dispose === 'function') {
            viewerRef.current.dispose();
          }
        } catch (e) {
          // Игнорируем
        }
        viewerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [skinUrl, title]);

  return <div ref={containerRef} className={`skin-card-canvas ${className || ''}`} />;
}