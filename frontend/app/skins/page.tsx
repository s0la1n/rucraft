import { Suspense } from "react";
import { PageSection } from "../components/PageSection";
import { skinsApi, type SkinPost, type SkinsIndexResponse, resolveAssetUrl, getBackendBaseUrl } from "@/lib/api";
import { SkinsToolbar } from "./SkinsToolbar";

export const metadata = {
  title: "Скины — RuCraft",
  description: "Скины для Minecraft: смешные, для девочек, для мальчиков, аниме, мобы, ютуберы. Фото и развёртка для скачивания.",
};

const apiErrorMessage = (
  <p className="form-error">
    Не удалось загрузить данные. Убедитесь, что бэкенд запущен (<code>php artisan serve</code>) и в <code>.env.local</code> указан <code>NEXT_PUBLIC_API_URL</code> (например, http://localhost:8000/api).
  </p>
);

async function getSkins(params: { page?: number; category?: string }): Promise<SkinsIndexResponse & { error?: boolean }> {
  try {
    return await skinsApi.index(params);
  } catch (err) {
    console.error("Skins fetch failed:", err);
    return { data: [], current_page: 1, last_page: 1, per_page: 12, total: 0, error: true };
  }
}

function buildDownloadUrl(skinId: number): string {
  const base = getBackendBaseUrl().replace(/\/$/, "");
  return `${base}/api/skins/${skinId}/download`;
}

export default async function SkinsPage(props: { searchParams?: Promise<{ page?: string; category?: string }> | { page?: string; category?: string } }) {
  const raw = props.searchParams;
  const searchParams = typeof raw?.then === "function" ? await raw : (raw ?? {});
  const page = Math.max(1, parseInt(String(searchParams.page || "1"), 10) || 1);
  const category = searchParams.category ?? "";

  const result = await getSkins({ page, category: category || undefined });
  const { data: skins, current_page, last_page, error: fetchFailed } = result;

  return (
    <div className="page-content">
      <PageSection title="Скины">
        <div className="skins-list-page">
          <Suspense fallback={null}>
            <SkinsToolbar />
          </Suspense>

          {fetchFailed ? (
            apiErrorMessage
          ) : skins.length === 0 ? (
            <p>Скинов пока нет.</p>
          ) : (
            <>
              <div className="skins-grid-page">
                {skins.map((skin) => {
                  const imageSrc = resolveAssetUrl(skin.image) ?? "/placeholder-skin.png";
                  const downloadUrl = buildDownloadUrl(skin.id);

                  return (
                    <article key={skin.id} className="skin-card-page">
                      <div className="skin-card-image-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageSrc} alt={skin.title} />
                      </div>
                      <h3 className="skin-card-name">{skin.title}</h3>
                      <p className="skin-card-category">{skin.category}</p>
                      <div className="skin-card-footer">
                        <a href={downloadUrl} className="skin-card-download" download>
                          Скачать
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              {last_page > 1 && (
                <nav className="skins-pagination" aria-label="Пагинация скинов">
                  {current_page > 1 && (
                    <a href={category ? `/skins?page=${current_page - 1}&category=${encodeURIComponent(category)}` : `/skins?page=${current_page - 1}`}>
                      Назад
                    </a>
                  )}
                  <span className="current">
                    {current_page} / {last_page}
                  </span>
                  {current_page < last_page && (
                    <a href={category ? `/skins?page=${current_page + 1}&category=${encodeURIComponent(category)}` : `/skins?page=${current_page + 1}`}>
                      Вперёд
                    </a>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </PageSection>
    </div>
  );
}
