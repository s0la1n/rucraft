"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { modsApi, type ModPost, resolveAssetUrl, getBaseUrl } from "@/lib/api";
import "../mods.css";

export default function ModShowPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [mod, setMod] = useState<ModPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Некорректный идентификатор мода.");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    modsApi
      .show(id)
      .then((response) => {
        setMod(response.data);
      })
      .catch(() => {
        setError("Не удалось загрузить мод.");
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

  return (
    <div className="page-content">
      <PageSection title={mod ? mod.title : "Мод"}>
        {loading && <p>Загрузка…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && mod && (
          <div className="mod-show">
            <div className="mod-header">
              <p className="mod-author">
                Автор: <strong>{mod.author.name}</strong>
              </p>
              
              <div className="mod-badges">
                {mod.version && (
                  <span className="badge">{mod.version}</span>
                )}
                {mod.minecraft_version && (
                  <span className="badge">MC {mod.minecraft_version}</span>
                )}
              </div>
            </div>

            {mod.images?.length > 0 && (
              <div className="mod-images-grid">
                {mod.images.map((src) => {
                  const resolved = resolveAssetUrl(src) ?? src;
                  const ext = src.split(".").pop()?.toLowerCase();
                  const isVideo = ext === "mp4" || ext === "webm" || ext === "ogg";

                  return (
                    <div 
                      key={src} 
                      className="mod-image"
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
                        <img src={resolved} alt={mod.title} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {mod.description && <p className="mod-desc">{mod.description}</p>}

            <div className="mod-actions">
              <a
                href={`${getBaseUrl().replace(/\/$/, "")}/mods/${mod.id}/download`}
                className="skin-card-download"
                download
              >
                скачать архив
              </a>
              
              <button 
                className="btn-instr"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? 'понятно' : 'как установить?'}
              </button>
            </div>

            {showInstructions && (
              <div className="mod-instr">
                <p>1. Скачай архив</p>
                <p>2. Открой папку .minecraft/mods</p>
                <p>3. Перемести файл туда</p>
                <p>4. Запусти игру с Forge/Fabric</p>
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
    </div>
  );
}