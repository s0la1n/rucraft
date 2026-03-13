"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { buildsApi, type BuildPost, resolveStorageUrl, getBaseUrl } from "@/lib/api";
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

  const openCraft = (blockName: string, count: number) => {
    if (hasRecipe(blockName)) {
      setSelectedBlock({ name: blockName, count });
    }
  };

  const closeCraft = () => {
    setSelectedBlock(null);
  };

  return (
    <div className="page-content">
      <PageSection title={build ? build.title : "Постройка"}>
        <div className="build-show-page">
          {loading && <p>Загрузка…</p>}
          {error && <p className="form-error">{error}</p>}
          {!loading && !error && build && (
            <div className="space-y-4">
              <div className="build-show-header">
                <h1 className="build-show-title">{build.title}</h1>
                <p className="build-show-author">
                  Автор: <strong>{build.author.name}</strong>
                </p>
              </div>

              {build.description && <p className="build-show-description">{build.description}</p>}

              {build.images?.length > 0 && (
                <div className="build-show-images">
                  {build.images.map((src) => {
                    const resolved = resolveStorageUrl(src) ?? src;
                    const ext = src.split(".").pop()?.toLowerCase();
                    const isVideo = ext === "mp4" || ext === "webm" || ext === "ogg";

                    return (
                      <div
                        key={src}
                        className="build-show-image"
                        style={{ "--rot": `${(Math.random() - 0.5) * 4}deg` } as React.CSSProperties}
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
                    );
                  })}
                </div>
              )}

              {build.blocks?.length > 0 && (
                <div className="build-blocks-section">
                  <h3 className="mb-2 font-semibold">Необходимые ресурсы</h3>
                  <div className="build-blocks-grid">
                    {build.blocks.map((block) => {
                      const recipeExists = hasRecipe(block.name);

                      return (
                        <div
                          key={block.name}
                          className={`build-block-item ${recipeExists ? 'has-recipe' : ''}`}
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
                            <span className="build-block-craft">[?]</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {build.file_url && (
                <div className="build-actions">
                  <a
                    href={`${getBaseUrl().replace(/\/$/, "")}/builds/${build.id}/download`}
                    className="build-btn-primary"
                    download
                  >
                    скачать
                  </a>

                  <button
                    className="build-btn-secondary"
                    onClick={() => setShowInstructions(!showInstructions)}
                  >
                    {showInstructions ? 'понятно' : 'как установить?'}
                  </button>
                </div>
              )}

              {showInstructions && (
                <div className="build-instr">
                  <p>1. Скачай файл постройки</p>
                  <p>2. Помести в папку saves (для одиночной игры)</p>
                  <p>3. Или используй WorldEdit / Schematica для загрузки</p>
                  <p>4. Загрузи мир в игре</p>
                </div>
              )}
            </div>
          )}
        </div>
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