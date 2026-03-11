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
    if (!containerRef.current) return;

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

        viewer = new SkinViewer({
          canvas,
          width: 220,
          height: 260,
          skin: skinUrl,
        });

        viewer.zoom = 0.9;
        viewer.autoRotate = true;

        if (mod.WalkingAnimation) {
          viewer.animation = new mod.WalkingAnimation();
        }
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
  }, [skinUrl]);

  return <div ref={containerRef} className={className} aria-label={title} />;
}

