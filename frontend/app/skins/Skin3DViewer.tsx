"use client";

import { useEffect, useRef, useState } from "react";
import { getBackendBaseUrl, resolveAssetUrl } from "@/lib/api";

interface Skin3DViewerProps {
  skinUrl?: string | null;
  skinDataURL?: string | null;
  title: string;
  className?: string;
  autoRotate?: boolean;
  width?: number;
  height?: number;
}

export function Skin3DViewer({ 
  skinUrl, 
  skinDataURL,
  title, 
  className,
  autoRotate = true,
  width = 220,
  height = 260
}: Skin3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let disposed = false;
    let finalUrl: string | null = null;

    // Определяем какой URL использовать
    if (skinDataURL) {
      finalUrl = skinDataURL;
      console.log(`[Skin3DViewer] Using data URL for ${title}`);
    } else if (skinUrl) {
      try {
        // Проверяем тип
        if (typeof skinUrl !== 'string') {
          console.log(`[Skin3DViewer] Invalid skin URL type for ${title}:`, typeof skinUrl);
          setError('Неверный тип URL');
          setIsLoading(false);
          return;
        }

        const trimmedUrl = skinUrl.trim();
        if (!trimmedUrl || trimmedUrl === 'null' || trimmedUrl === 'undefined') {
          console.log(`[Skin3DViewer] Empty skin URL for ${title}`);
          setError('Пустой URL');
          setIsLoading(false);
          return;
        }

        // Получаем относительный URL через resolveAssetUrl
        const relativeUrl = resolveAssetUrl(trimmedUrl);
        console.log(`[Skin3DViewer] Relative URL for ${title}:`, relativeUrl);
        
        if (!relativeUrl) {
          console.log(`[Skin3DViewer] Could not resolve URL for ${title}:`, trimmedUrl);
          setError('Не удалось преобразовать URL');
          setIsLoading(false);
          return;
        }

        // Для skinview3d нужен абсолютный URL
        // Если URL уже абсолютный - используем как есть
        if (relativeUrl.startsWith('http')) {
          finalUrl = relativeUrl;
        } else {
          // Иначе добавляем базовый URL бэкенда
          const backendBase = getBackendBaseUrl().replace(/\/$/, "");
          // Убираем лишние слеши
          const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
          finalUrl = `${backendBase}${cleanRelative}`;
        }
        
        console.log(`[Skin3DViewer] Final absolute URL for ${title}:`, finalUrl);
        
      } catch (err) {
        console.error(`[Skin3DViewer] Error processing URL for ${title}:`, err);
        setError('Ошибка обработки URL');
        setIsLoading(false);
        return;
      }
    } else {
      console.log(`[Skin3DViewer] No URL for ${title}`);
      setError('Нет изображения');
      setIsLoading(false);
      return;
    }

    if (!containerRef.current) return;

    const initViewer = async () => {
      try {
        // Очищаем предыдущий viewer
        if (viewerRef.current) {
          try {
            if (typeof viewerRef.current.dispose === 'function') {
              viewerRef.current.dispose();
            }
          } catch (e) {}
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
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        
        containerRef.current.appendChild(canvas);

        // Создаем viewer
        const viewer = new skinview3d.SkinViewer({
          canvas: canvas,
          width: width,
          height: height
        });

        viewerRef.current = viewer;
        
        // Настройки
        if (typeof viewer.zoom !== 'undefined') {
          viewer.zoom = 0.9;
        }
        
        if (typeof viewer.autoRotate !== 'undefined') {
          viewer.autoRotate = autoRotate;
        }
        
        if (viewer.playerObject) {
          viewer.playerObject.rotation.y = Math.PI / 4;
        }

        // Загружаем скин
        setIsLoading(true);
        try {
          await viewer.loadSkin(finalUrl!);
          setError(null);
          console.log(`[Skin3DViewer] Successfully loaded skin for ${title}`);
        } catch (loadError) {
          console.warn(`[Skin3DViewer] Failed to load skin:`, loadError);
          setError('Ошибка загрузки');
        } finally {
          setIsLoading(false);
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
        setError('Ошибка инициализации');
        setIsLoading(false);
      }
    };

    initViewer();

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
        } catch (e) {}
        viewerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [skinUrl, skinDataURL, title, autoRotate, width, height]);

  return (
    <div 
      ref={containerRef} 
      className={`skin-3d-viewer ${className || ''} ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}
      style={{ width: '100%', height: '100%', minHeight: height }}
    />
  );
}