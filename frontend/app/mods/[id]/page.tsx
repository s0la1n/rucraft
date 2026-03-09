"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { modsApi, type ModPost, resolveAssetUrl, getBaseUrl } from "@/lib/api";

export default function ModShowPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [mod, setMod] = useState<ModPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="page-content">
      <PageSection title={mod ? mod.title : "Мод"}>
        {loading && <p>Загрузка…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && mod && (
          <div className="space-y-4">
            <p>
              Автор: <strong>{mod.author.name}</strong>
            </p>
            {mod.description && <p>{mod.description}</p>}
            {mod.images?.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {mod.images.map((src) => {
                  const resolved = resolveAssetUrl(src) ?? src;
                  const ext = src.split(".").pop()?.toLowerCase();
                  const isVideo = ext === "mp4" || ext === "webm" || ext === "ogg";

                  return (
                    <div key={src} className="overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700">
                      {isVideo ? (
                        <video
                          src={resolved}
                          className="h-full w-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resolved} alt={mod.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p>
              Файл:{" "}
              <a
                href={`${getBaseUrl().replace(/\/$/, "")}/mods/${mod.id}/download`}
                className="btn-primary inline-flex"
                download
              >
                скачать архив
              </a>
            </p>
          </div>
        )}
      </PageSection>
    </div>
  );
}

