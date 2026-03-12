/* eslint-disable @typescript-eslint/no-magic-numbers */
"use client";

import { useEffect, useRef, useState, type MouseEvent, type WheelEvent as ReactWheelEvent } from "react";

type BiomeId =
  | "ocean"
  | "plains"
  | "forest"
  | "desert"
  | "mountains"
  | "taiga"
  | "swamp"
  | "snowy";

type Platform = "java" | "bedrock";

type VersionOption = {
  id: string;
  label: string;
  platform: Platform;
};

type StructureType = "village" | "temple" | "mine" | "pillager";

type StructureMarker = {
  id: string;
  type: StructureType;
  worldX: number;
  worldZ: number;
  screenX: number;
  screenY: number;
};

const BIOME_COLORS: Record<BiomeId, string> = {
  ocean: "#1f3b70",
  plains: "#7ec850",
  forest: "#228b22",
  desert: "#e5d17a",
  mountains: "#8f8f8f",
  taiga: "#2e5e4e",
  swamp: "#3b5a40",
  snowy: "#f5f5f5",
};

const BIOME_LABELS: Record<BiomeId, string> = {
  ocean: "Океан",
  plains: "Равнины",
  forest: "Лес",
  desert: "Пустыня",
  mountains: "Горы",
  taiga: "Тайга",
  swamp: "Болото",
  snowy: "Заснеженные равнины",
};

const STRUCTURE_LABELS: Record<StructureType, string> = {
  village: "Деревня",
  temple: "Храм",
  mine: "Шахта",
  pillager: "Аванпост разбойников",
};

const STRUCTURE_ICONS: Record<StructureType, string> = {
  village: "/map/village.png",
  temple: "/map/temple.png",
  mine: "/map/mine.png",
  pillager: "/map/pillager.png",
};

const VERSIONS: VersionOption[] = [
  { id: "java_1_21", label: "Java 1.21", platform: "java" },
  { id: "java_1_20", label: "Java 1.20", platform: "java" },
  { id: "java_1_19", label: "Java 1.19", platform: "java" },
  { id: "java_1_18", label: "Java 1.18", platform: "java" },
  { id: "java_1_17", label: "Java 1.17", platform: "java" },
  { id: "java_1_16", label: "Java 1.16", platform: "java" },
  { id: "java_1_15", label: "Java 1.15", platform: "java" },
  { id: "java_1_14", label: "Java 1.14", platform: "java" },
  { id: "bedrock_1_21_120", label: "Bedrock 1.21.120+", platform: "bedrock" },
  { id: "bedrock_1_20", label: "Bedrock 1.20", platform: "bedrock" },
  { id: "bedrock_1_19", label: "Bedrock 1.19", platform: "bedrock" },
];

// Простая детерминированная псевдослучайная функция на основе сида и координат
function hashToUnit(seed: number, x: number, z: number): number {
  let n = x * 374761393 + z * 668265263 + seed * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  n = (n ^ (n >> 16)) >>> 0;
  return (n & 0xffffffff) / 0xffffffff;
}

// Гладкий value-noise на основе hashToUnit с несколькими октавами
function layeredNoise(seed: number, x: number, z: number): number {
  const scale1 = 1 / 256;
  const scale2 = 1 / 96;
  const scale3 = 1 / 32;

  const n1 = hashToUnit(seed + 11, Math.floor(x * scale1), Math.floor(z * scale1));
  const n2 = hashToUnit(seed + 29, Math.floor(x * scale2), Math.floor(z * scale2));
  const n3 = hashToUnit(seed + 47, Math.floor(x * scale3), Math.floor(z * scale3));

  const v = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;
  return v;
}

// Учитываем платформу и версию при генерации, чтобы сиды для разных версий
// давали разные карты (приближено к поведению оригинала)
function mixSeed(seed: number, platform: Platform, versionId: string): number {
  let acc = seed | 0;
  const tag = `${platform}:${versionId}`;
  for (let i = 0; i < tag.length; i += 1) {
    acc = (acc * 31 + tag.charCodeAt(i)) | 0;
  }
  return acc || 1;
}

function pickBiome(seedBase: number, x: number, z: number): BiomeId {
  // Высота и влажность для более природных форм рельефа,
  // усредняем по окрестности, чтобы сделать переходы более плавными
  const offset = 32;
  const elevation =
    (layeredNoise(seedBase, x, z) +
      layeredNoise(seedBase, x + offset, z) +
      layeredNoise(seedBase, x, z + offset) +
      layeredNoise(seedBase, x + offset, z + offset)) /
    4;

  const moisture =
    (layeredNoise(seedBase + 999, x, z) +
      layeredNoise(seedBase + 999, x + offset, z) +
      layeredNoise(seedBase + 999, x, z + offset) +
      layeredNoise(seedBase + 999, x + offset, z + offset)) /
    4;

  const riverNoise = layeredNoise(seedBase + 555, x, z);

  // Вода и «реки»: низкая высота + повышенная влажность или полоса вокруг значения шума
  if (
    elevation < 0.22 ||
    (elevation < 0.32 && moisture > 0.6) ||
    Math.abs(riverNoise - 0.5) < 0.02
  ) {
    return "ocean";
  }

  // Снег на высоких высотах
  if (elevation > 0.8) {
    return "snowy";
  }

  // Горы средних высот
  if (elevation > 0.65) {
    return moisture < 0.4 ? "mountains" : "taiga";
  }

  // Низины и средние высоты
  if (moisture < 0.25) {
    return "desert";
  }
  if (moisture < 0.45) {
    return "plains";
  }
  if (moisture < 0.7) {
    return "forest";
  }
  return "swamp";
}

type HoverInfo = {
  worldX: number;
  worldZ: number;
  chunkX: number;
  chunkZ: number;
  biome: BiomeId;
} | null;

export function SeedMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [seedInput, setSeedInput] = useState<string>("1058938605076983349");
  const [seed, setSeed] = useState<number>(1058938605);
  const [platform, setPlatform] = useState<Platform>("bedrock");
  const [versionId, setVersionId] = useState<string>("bedrock_1_21_120");
  const [centerX, setCenterX] = useState<number>(411);
  const [centerZ, setCenterZ] = useState<number>(769);
  const [zoom, setZoom] = useState<number>(1);
  const [hover, setHover] = useState<HoverInfo>(null);
  const [structures, setStructures] = useState<StructureMarker[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<StructureMarker | null>(null);
  
  // Состояния для перетаскивания
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCenter, setDragCenter] = useState({ x: centerX, z: centerZ });

  const applySeed = () => {
    const trimmed = seedInput.trim();
    if (!trimmed) return;

    let numericSeed: number;
    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
      numericSeed = asNumber;
    } else {
      // Преобразуем строку в детерминированное число
      let hash = 0;
      for (let i = 0; i < trimmed.length; i += 1) {
        hash = (hash * 31 + trimmed.charCodeAt(i)) | 0;
      }
      numericSeed = hash || 1;
    }

    setSeed(numericSeed);
  };

  // Функция для преобразования экранных координат в мировые
  const screenToWorld = (screenX: number, screenY: number, currentCenterX: number, currentCenterZ: number, currentZoom: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { worldX: 0, worldZ: 0 };

    const width = canvas.width;
    const height = canvas.height;
    const blocksPerPixel = 8 / currentZoom;
    const halfWidthBlocks = (width * blocksPerPixel) / 2;
    const halfHeightBlocks = (height * blocksPerPixel) / 2;

    const startX = currentCenterX - halfWidthBlocks;
    const startZ = currentCenterZ - halfHeightBlocks;

    const worldX = startX + screenX * blocksPerPixel;
    const worldZ = startZ + screenY * blocksPerPixel;

    return { worldX, worldZ };
  };

  // Колесико мыши: зум + запрет прокрутки страницы (не глобально, а только внутри карты)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const onWheel = (e: globalThis.WheelEvent) => {
      // Блокируем прокрутку страницы, когда колесо крутят над картой
      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // если колесо крутят по контейнеру, но не над самим канвасом — ничего не делаем
      if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) return;

      // Переводим в координаты "буфера" канваса (на случай scale в CSS)
      const sx = (mouseX / rect.width) * canvas.width;
      const sy = (mouseY / rect.height) * canvas.height;

      const delta = e.deltaY > 0 ? -0.15 : 0.15;

      const { worldX: worldXBefore, worldZ: worldZBefore } = screenToWorld(
        sx,
        sy,
        centerX,
        centerZ,
        zoom
      );

      const newZoom = Math.max(0.25, Math.min(8, zoom * (1 + delta)));

      const { worldX: worldXAfter, worldZ: worldZAfter } = screenToWorld(
        sx,
        sy,
        centerX,
        centerZ,
        newZoom
      );

      setCenterX((prev) => prev + (worldXBefore - worldXAfter));
      setCenterZ((prev) => prev + (worldZBefore - worldZAfter));
      setZoom(newZoom);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel as EventListener);
  }, [centerX, centerZ, zoom]);

  // Обработчики для перетаскивания
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Только левая кнопка мыши
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragCenter({ x: centerX, z: centerZ });
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (isDragging) {
      // Перетаскивание карты
      e.preventDefault();
      e.stopPropagation();
      
      const blocksPerPixel = 8 / zoom;
      
      const dx = (dragStart.x - e.clientX) * blocksPerPixel;
      const dy = (dragStart.y - e.clientY) * blocksPerPixel;
      
      // Обновляем центр карты
      const newCenterX = dragCenter.x + dx;
      const newCenterZ = dragCenter.z + dy;
      
      setCenterX(newCenterX);
      setCenterZ(newCenterZ);
      
      // Обновляем dragCenter для следующего шага, чтобы движение было плавным
      setDragCenter({ x: newCenterX, z: newCenterZ });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Обновление информации при наведении
      const width = canvas.width;
      const height = canvas.height;
      const seedBase = mixSeed(seed, platform, versionId);
      const blocksPerPixel = 8 / zoom;
      const halfWidthBlocks = (width * blocksPerPixel) / 2;
      const halfHeightBlocks = (height * blocksPerPixel) / 2;

      const startX = centerX - halfWidthBlocks;
      const startZ = centerZ - halfHeightBlocks;

      const worldX = Math.floor(startX + px * blocksPerPixel);
      const worldZ = Math.floor(startZ + py * blocksPerPixel);

      const biome = pickBiome(seedBase, worldX, worldZ);
      const chunkX = Math.floor(worldX / 16);
      const chunkZ = Math.floor(worldZ / 16);

      setHover({
        worldX,
        worldZ,
        chunkX,
        chunkZ,
        biome,
      });
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
    setHover(null);
    setIsDragging(false);
  };

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    // Не обрабатываем клик, если было перетаскивание
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    let closest: StructureMarker | null = null;
    let closestDist = Infinity;

    for (const s of structures) {
      const dx = s.screenX - px;
      const dy = s.screenY - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 6 && dist < closestDist) {
        closest = s;
        closestDist = dist;
      }
    }

    setSelectedStructure(closest);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const seedBase = mixSeed(seed, platform, versionId);

    const blocksPerPixel = 8 / zoom;
    const halfWidthBlocks = (width * blocksPerPixel) / 2;
    const halfHeightBlocks = (height * blocksPerPixel) / 2;

    const startX = centerX - halfWidthBlocks;
    const startZ = centerZ - halfHeightBlocks;
    const endX = centerX + halfWidthBlocks;
    const endZ = centerZ + halfHeightBlocks;

    // Отрисовка карты
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let py = 0; py < height; py += 1) {
      for (let px = 0; px < width; px += 1) {
        const worldX = startX + px * blocksPerPixel;
        const worldZ = startZ + py * blocksPerPixel;

        const biome = pickBiome(seedBase, worldX, worldZ);
        const color = BIOME_COLORS[biome];

        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        const idx = (py * width + px) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Генерация структур
    const newStructures: StructureMarker[] = [];

    const gridStep = 8;

    const startChunkX = Math.floor((startX - 64) / 16);
    const endChunkX = Math.ceil((endX + 64) / 16);
    const startChunkZ = Math.floor((startZ - 64) / 16);
    const endChunkZ = Math.ceil((endZ + 64) / 16);

    // Выровняем сетку по кратным gridStep, чтобы метки не «прыгали» при небольшом сдвиге
    const firstGridChunkX = Math.floor(startChunkX / gridStep) * gridStep;
    const firstGridChunkZ = Math.floor(startChunkZ / gridStep) * gridStep;

    for (let chunkX = firstGridChunkX; chunkX <= endChunkX; chunkX += gridStep) {
      for (let chunkZ = firstGridChunkZ; chunkZ <= endChunkZ; chunkZ += gridStep) {
        const noise = hashToUnit(seedBase + 12345, chunkX, chunkZ);

        let type: StructureType | null = null;
        if (noise < 0.004) type = "village";
        else if (noise < 0.008) type = "temple";
        else if (noise < 0.012) type = "mine";
        else if (noise < 0.016) type = "pillager";

        if (!type) continue;

        const worldX = chunkX * 16 + 8;
        const worldZ = chunkZ * 16 + 8;

        if (worldX < startX - 64 || worldX > endX + 64 || 
            worldZ < startZ - 64 || worldZ > endZ + 64) {
          continue;
        }

        const screenX = (worldX - startX) / blocksPerPixel;
        const screenY = (worldZ - startZ) / blocksPerPixel;

        if (screenX >= -10 && screenX <= width + 10 && 
            screenY >= -10 && screenY <= height + 10) {
          newStructures.push({
            id: `${type}_${chunkX}_${chunkZ}`,
            type,
            worldX,
            worldZ,
            screenX: Math.max(0, Math.min(width, screenX)),
            screenY: Math.max(0, Math.min(height, screenY)),
          });
        }
      }
    }

    setStructures(newStructures);
  }, [seed, platform, versionId, centerX, centerZ, zoom]);

  const pan = (dx: number, dz: number) => {
    const step = 128 / zoom;
    setCenterX((prev) => prev + dx * step);
    setCenterZ((prev) => prev + dz * step);
  };

  const zoomIn = () => {
    const newZoom = Math.min(8, zoom * 1.5);
    setZoom(newZoom);
  };
  
  const zoomOut = () => {
    const newZoom = Math.max(0.25, zoom / 1.5);
    setZoom(newZoom);
  };

  const visibleVersions = VERSIONS.filter((v) => v.platform === platform);

  return (
    <div className="seedmap-root">
      <div className="seedmap-controls mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm">
            Сид:
            <input
              type="text"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              className="ml-2 rounded border border-gray-600 bg-black/40 px-2 py-1 text-sm text-white"
            />
          </label>
          <button type="button" onClick={applySeed} className="btn-link text-sm">
            Применить
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
          <span>Платформа:</span>
          <select
            value={platform}
            onChange={(e) => {
              const next = e.target.value as Platform;
              setPlatform(next);
              const first = VERSIONS.find((v) => v.platform === next);
              if (first) {
                setVersionId(first.id);
              }
            }}
            className="rounded border border-gray-600 bg-black/40 px-2 py-1 text-sm"
          >
            <option value="java">Java</option>
            <option value="bedrock">Bedrock</option>
          </select>

          <span>Версия:</span>
          <select
            value={versionId}
            onChange={(e) => setVersionId(e.target.value)}
            className="rounded border border-gray-600 bg-black/40 px-2 py-1 text-sm"
          >
            {visibleVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>Зум:</span>
          <button
            type="button"
            onClick={zoomOut}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-600 bg-black/40"
          >
            -
          </button>
          <span>{zoom.toFixed(2)}</span>
          <button
            type="button"
            onClick={zoomIn}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-600 bg-black/40"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-300">
          <span>Смещение:</span>
          <button
            type="button"
            onClick={() => pan(0, -3)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-600 bg-black/40"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => pan(-3, 0)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-600 bg-black/40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => pan(3, 0)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-600 bg-black/40"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => pan(0, 3)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-600 bg-black/40"
          >
            ↓
          </button>
        </div>
      </div>

      {/* Контейнер карты с ref и явным position: relative */}
      <div 
        ref={mapContainerRef}
        className="relative inline-block overflow-hidden rounded-lg border border-gray-700 bg-black"
        style={{ 
          position: 'relative',
          margin: '0 auto',
          width: '800px',
        }}
      >
        {/* Канвас с обработчиками событий */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="block cursor-grab active:cursor-grabbing select-none"
          style={{ 
            display: 'block',
            width: '800px',
            height: '600px',
            userSelect: 'none', // Предотвращаем выделение текста при перетаскивании
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />

        {/* Слой с метками */}
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '800px',
            height: '600px',
            zIndex: 100,
            pointerEvents: 'none'
          }}
        >
          {structures.map((s) => (
            <button
              key={s.id}
              type="button"
              style={{
                position: 'absolute',
                left: s.screenX,
                top: s.screenY,
                width: '24px',
                height: '24px',
                transform: 'translate(-50%, -50%)',
                zIndex: 101,
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStructure(s);
              }}
            >
              <img
                src={STRUCTURE_ICONS[s.type]}
                alt={STRUCTURE_LABELS[s.type]}
                style={{
                  width: '100%',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                }}
                className="hover:scale-110 transition-transform"
                draggable={false} // Предотвращаем перетаскивание изображения
              />
            </button>
          ))}
        </div>

        {/* Координаты по краям карты */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '800px',
            height: '600px',
            zIndex: 50,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#000',
            padding: '4px 8px',
            textShadow: '0 0 3px rgba(255,255,255,0.5)' // Добавляем тень для лучшей читаемости
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>X: {Math.round(centerX)} Z: {Math.round(centerZ)}</span>
            <span>{platform.toUpperCase()} {visibleVersions.find((v) => v.id === versionId)?.label}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Зум: {zoom.toFixed(2)}</span>
            <span>Сид: {seedInput}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 text-sm text-gray-200">
        <div>
          {hover ? (
            <>
              <div className="mb-1">
                Биом: <strong>{BIOME_LABELS[hover.biome]}</strong>
              </div>
              <div className="mb-1">
                Координаты: X = {hover.worldX}, Z = {hover.worldZ}
              </div>
              <div>
                Чанк: ({hover.chunkX}, {hover.chunkZ})
              </div>
            </>
          ) : (
            <span>Наведите курсор на карту, чтобы увидеть биом и координаты.</span>
          )}

          {selectedStructure && (
            <div className="mt-3 rounded border border-gray-600 bg-black/40 p-2 text-xs">
              <div className="font-semibold">
                {STRUCTURE_LABELS[selectedStructure.type]} (X: {selectedStructure.worldX}, Z:{" "}
                {selectedStructure.worldZ})
              </div>
              <div className="text-gray-400">
                Чанк: ({Math.floor(selectedStructure.worldX / 16)},{" "}
                {Math.floor(selectedStructure.worldZ / 16)})
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 text-xs text-gray-400">
          <div>
            <div className="mb-1 font-semibold text-gray-200">Биомы</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BIOME_COLORS) as Array<BiomeId>).map((id) => (
                <div key={id} className="flex items-center gap-1">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: BIOME_COLORS[id] }}
                  />
                  <span>{BIOME_LABELS[id]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 font-semibold text-gray-200">Структуры</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STRUCTURE_LABELS) as Array<StructureType>).map((id) => (
                <div key={id} className="flex items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={STRUCTURE_ICONS[id]}
                    alt={STRUCTURE_LABELS[id]}
                    className="h-3 w-3"
                    draggable={false}
                  />
                  <span>{STRUCTURE_LABELS[id]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}