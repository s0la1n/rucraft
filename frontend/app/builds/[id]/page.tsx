"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { buildsApi, type BuildPost, resolveAssetUrl, getBaseUrl } from "@/lib/api";
import { CraftModal } from "./CraftModal";
import "../builds.css";

// База знаний рецептов
const CRAFT_RECIPES: Record<string, { result: string, count: number, pattern: string[], ingredients: Record<string, string> }> = {
  "камень": {
    result: "Камень",
    count: 1,
    pattern: [" B ", " B ", " B "],
    ingredients: { "B": "Булыжник" }
  },
  "каменный кирпич": {
    result: "Каменный кирпич",
    count: 4,
    pattern: ["BB ", "BB ", "   "],
    ingredients: { "B": "Камень" }
  },
  "доски": {
    result: "Доски",
    count: 4,
    pattern: ["B  ", "   ", "   "],
    ingredients: { "B": "Бревно" }
  },
  "палка": {
    result: "Палка",
    count: 4,
    pattern: ["B  ", "B  ", "   "],
    ingredients: { "B": "Доски" }
  },
  "песчаник": {
    result: "Песчаник",
    count: 1,
    pattern: ["BB ", "BB ", "   "],
    ingredients: { "B": "Песок" }
  },
  "пурпурный блок": {
    result: "Пурпурный блок",
    count: 4,
    pattern: ["BF ", "FB ", "   "],
    ingredients: { "B": "Плод коруса", "F": "Огненный стержень" }
  },
  "еловые доски": {
    result: "Еловые доски",
    count: 4,
    pattern: ["B  ", "   ", "   "],
    ingredients: { "B": "Еловое бревно" }
  }
};

// Функция для получения CSS класса иконки
const getBlockClass = (blockName: string): string => {
  const map: Record<string, string> = {
    "камень": "item_1 item_1_0",
    "булыжник": "item_4 item_4_0",
    "каменный кирпич": "item_98 item_98_0",
    "доски": "item_5 item_5_0",
    "еловые доски": "item_5 item_5_1",
    "палка": "item_280 item_280_0",
    "песчаник": "item_24 item_24_0",
    "стекло": "item_20 item_20_0",
    "белый бетон": "item_251 item_251_0",
    "пурпурный блок": "item_201 item_201_0",
    "призмарин": "item_168 item_168_0",
    "бетон": "item_251 item_251_0",
    "дерево": "item_17 item_17_0",
    "еловое бревно": "item_17 item_17_1",
    "земля": "item_3 item_3_0",
    "песок": "item_12 item_12_0",
    "глина": "item_337 item_337_0",
    "бревно": "item_17 item_17_0",
    "плод коруса": "item_432 item_432_0",
    "огненный стержень": "item_369 item_369_0",
  };
  return map[blockName.toLowerCase()] || "item_1 item_1_0";
};

// Функция для проверки наличия рецепта
const hasRecipe = (blockName: string): boolean => {
  return !!CRAFT_RECIPES[blockName.toLowerCase()];
};

export default function BuildShowPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [build, setBuild] = useState<BuildPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<{ name: string, count: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Некорректный идентификатор постройки.");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    buildsApi
      .show(id)
      .then((response) => {
        setBuild(response.data);
      })
      .catch(() => {
        setError("Не удалось загрузить постройку.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);
  
  const openModal = (src: string) => {
    setSelectedImage(src);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const openCraft = (blockName: string, count: number) => {
    if (hasRecipe(blockName)) {
      setSelectedBlock({ name: blockName, count });
    }
  };

  const closeCraft = () => {
    setSelectedBlock(null);
  };

  const totalBlocks = build?.blocks?.reduce((sum, block) => sum + block.count, 0) || 0;

  return (
    <div className="page-content">
      <PageSection title={build ? build.title : "Постройка"}>
        {loading && <p>Загрузка…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && build && (
          <div className="build-show">
            <div className="build-header">
              <p className="build-author">
                Автор: <strong>{build.author.name}</strong>
              </p>
              
              <div className="build-badges">
                {build.minecraft_version && (
                  <span className="badge">MC {build.minecraft_version}</span>
                )}
                {build.difficulty && (
                  <span className="badge">{build.difficulty}</span>
                )}
              </div>
            </div>

            {build.images?.length > 0 && (
              <div className="build-images-grid">
                {build.images.map((src) => {
                  const resolved = resolveAssetUrl(src) ?? src;
                  const ext = src.split(".").pop()?.toLowerCase();
                  const isVideo = ext === "mp4" || ext === "webm" || ext === "ogg";

                  return (
                    <div key={src} className="build-image-wrapper">
                      <div 
                        className="build-image"
                        onClick={() => !isVideo && openModal(resolved)}
                        style={{ cursor: !isVideo ? 'pointer' : 'default' }}
                      >
                        {isVideo ? (
                          <video
                            src={resolved}
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <img src={resolved} alt={build.title} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {build.description && <p className="build-desc">{build.description}</p>}

            {build.blocks && build.blocks.length > 0 && (
              <div className="build-blocks-section">
                <div className="blocks-header">
                  <h3 className="build-blocks-title">Необходимые ресурсы</h3>
                  <div className="total-blocks">
                    <span className="total-label">Всего блоков:</span>
                    <span className="total-count">{totalBlocks}</span>
                  </div>
                </div>
                
                <div className="build-blocks-grid">
                  {build.blocks.map((block) => {
                    const recipeExists = hasRecipe(block.name);
                    
                    return (
                      <div 
                        key={block.name} 
                        className={`build-block-item ${recipeExists ? 'has-recipe' : 'no-recipe'}`}
                        onClick={() => recipeExists && openCraft(block.name, block.count)}
                        style={{ cursor: recipeExists ? 'pointer' : 'default' }}
                      >
                        <div className="block-icon">
                          <span className={`item ${getBlockClass(block.name)}`}></span>
                        </div>
                        <div className="block-info">
                          <span className="build-block-name">{block.name}</span>
                          <span className="build-block-count">{block.count} шт.</span>
                        </div>
                        {recipeExists && (
                          <span className="build-block-craft">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <rect x="2" y="2" width="20" height="20" stroke="#ff69b4" strokeWidth="2" />
                              <line x1="2" y1="8" x2="22" y2="8" stroke="#ff69b4" strokeWidth="2" />
                              <line x1="2" y1="16" x2="22" y2="16" stroke="#ff69b4" strokeWidth="2" />
                              <line x1="8" y1="2" x2="8" y2="22" stroke="#ff69b4" strokeWidth="2" />
                              <line x1="16" y1="2" x2="16" y2="22" stroke="#ff69b4" strokeWidth="2" />
                            </svg>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="build-actions">
              <a
                href={`${getBaseUrl().replace(/\/$/, "")}/builds/${build.id}/download`}
                className="skin-card-download"
                download
              >
                скачать
              </a>
              
              <button 
                className="btn-instr"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? 'понятно' : 'как установить?'}
              </button>
            </div>

            {showInstructions && (
              <div className="build-instr">
                <p>1. Скачай файл постройки</p>
                <p>2. Помести в папку saves (для одиночной игры)</p>
                <p>3. Или используй WorldEdit / Schematica для загрузки</p>
                <p>4. Загрузи мир в игре</p>
              </div>
            )}

            {selectedImage && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content-bounce" onClick={(e) => e.stopPropagation()}>
                  <img src={selectedImage} alt="полноэкранное изображение" />
                  <button className="modal-close-btn" onClick={closeModal}>×</button>
                </div>
              </div>
            )}
          </div>
        )}
      </PageSection>
      
      {selectedBlock && (
        <CraftModal 
          blockName={selectedBlock.name}
          requiredCount={selectedBlock.count}
          onClose={closeCraft} 
          recipe={CRAFT_RECIPES[selectedBlock.name.toLowerCase()]}
          getBlockClass={getBlockClass}
        />
      )}
    </div>
  );
}