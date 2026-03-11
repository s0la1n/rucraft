"use client";

import { useEffect, useRef } from "react";

interface Skin3DViewerProps {
  skinUrl: string;
  title: string;
  className?: string;
}

export function Skin3DViewer({ skinUrl, title, className }: Skin3DViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Если нет контейнера - выходим
    if (!containerRef.current) return;

    // 2. ГАРАНТИРУЕМ, что skinUrl - это строка и она не пустая
    // Если это null, undefined или что-то еще - очищаем и выходим
    if (typeof skinUrl !== "string" || !skinUrl || skinUrl === "null") {
      containerRef.current.innerHTML = "";
      return;
    }

    // 3. Только ТЕПЕРЬ безопасно вызываем trim
    const normalizedUrl = skinUrl.trim();
    if (!normalizedUrl) return;

    let viewer: any | null = null;
    let disposed = false;

    (async () => {
      try {
        const mod: any = await import("skinview3d");
        if (disposed || !containerRef.current) return;

        const SkinViewer =
          mod.SkinViewer ??
          mod.default?.SkinViewer ??
          mod.default ??
          mod;

        const canvas = document.createElement("canvas");
        canvas.width = 220;
        canvas.height = 260;

        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(canvas);

        // Initialize WITHOUT the skin property to prevent unhandled construct errors
        viewer = new SkinViewer({
          canvas,
          width: 220,
          height: 260,
        });

        viewer.zoom = 0.9;
        viewer.autoRotate = true;

        if (mod.WalkingAnimation) {
          viewer.animation = new mod.WalkingAnimation();
        }

        // Load the skin safely and catch any [object Event] errors if the image fails to load
        viewer.loadSkin(normalizedUrl).catch((e: any) => {
          console.warn(`[Skin3DViewer] Failed to load skin texture for ${title}:`, e);
          // Optional: Load a guaranteed-to-exist fallback texture here if you want
        });

      } catch (e) {
        console.error("Failed to initialize skinview3d", e);
      }
    })();

    return () => {
      disposed = true;
      try {
        if (viewer && typeof viewer.dispose === "function") {
          viewer.dispose();
        }
      } catch {
        // ignore
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [skinUrl, title]);

  return <div ref={containerRef} className={className} aria-label={title} />;
}