import { Suspense } from "react";
import { PageSection } from "../components/PageSection";
import { skinsApi, type SkinPost, type SkinsIndexResponse, resolveAssetUrl, getBackendBaseUrl } from "@/lib/api";
import { SkinsToolbar } from "./SkinsToolbar";
import { Skin3DViewer } from "./Skin3DViewer";
import Link from "next/link";
import "./style.css";

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

// Компонент пагинации
function Pagination({ currentPage, totalPages, category }: { currentPage: number; totalPages: number; category: string }) {
  const maxVisible = 5; // Максимальное количество отображаемых страниц
  const halfVisible = Math.floor(maxVisible / 2);
  
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (category) {
      params.set('category', category);
    }
    return `/skins?${params.toString()}`;
  };

  return (
    <nav className="skins-pagination" aria-label="Пагинация скинов">
      <div className="pagination-container">
        {/* Кнопка "На первую" */}
        {currentPage > 1 && (
          <Link href={buildUrl(1)} className="pagination-first" aria-label="Первая страница">
            ⟪
          </Link>
        )}

        {/* Кнопка "Назад" */}
        {currentPage > 1 && (
          <Link href={buildUrl(currentPage - 1)} className="pagination-prev" aria-label="Предыдущая страница">
            ←
          </Link>
        )}

        {/* Номера страниц */}
        <div className="pagination-pages">
          {startPage > 1 && (
            <>
              <Link href={buildUrl(1)} className="pagination-page">1</Link>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <Link
              key={page}
              href={buildUrl(page)}
              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Link>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <Link href={buildUrl(totalPages)} className="pagination-page">{totalPages}</Link>
            </>
          )}
        </div>

        {/* Кнопка "Вперед" */}
        {currentPage < totalPages && (
          <Link href={buildUrl(currentPage + 1)} className="pagination-next" aria-label="Следующая страница">
            →
          </Link>
        )}

        {/* Кнопка "На последнюю" */}
        {currentPage < totalPages && (
          <Link href={buildUrl(totalPages)} className="pagination-last" aria-label="Последняя страница">
            ⟫
          </Link>
        )}
      </div>

      {/* Информация о записях */}
      <div className="pagination-info">
        Страница {currentPage} из {totalPages}
      </div>
    </nav>
  );
}

export default async function SkinsPage(props: { 
  searchParams: Promise<{ page?: string; category?: string }> 
}) {
  const searchParams = await props.searchParams;
  
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const category = searchParams.category ?? "";

  const result = await getSkins({ page, category: category || undefined });
  const { data: skins, current_page, last_page, total, per_page, error: fetchFailed } = result;

  // Вычисляем диапазон отображаемых записей
  const startItem = (current_page - 1) * per_page + 1;
  const endItem = Math.min(current_page * per_page, total);

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
            <div className="skins-empty">
              <p>Скинов пока нет.</p>
              <p className="skins-empty-hint">Попробуйте выбрать другую категорию или вернуться позже.</p>
            </div>
          ) : (
            <>
              {/* Информация о количестве записей */}
              <div className="skins-stats">
                Показано {startItem}-{endItem} из {total} скинов
              </div>

              {/* Сетка скинов */}
              <div className="skins-grid-page">
                {skins.map((skin, index) => {
                  const imageSrc = resolveAssetUrl(skin.file_url) ?? "/placeholder-skin.png";
                  const downloadUrl = `${getBackendBaseUrl().replace(/\/$/, "")}/api/skins/${skin.id}/download`;

                  return (
                    <article key={skin.id} className="skin-card-page">
                      <div className="skin-card-image-wrap">
                        {/* Загружаем только первые 8 скинов в 3D для оптимизации */}
                        {index < 12 ? (
                          <Skin3DViewer skinUrl={imageSrc} title={skin.title} className="skin-card-canvas" />
                        ) : (
                          <div className="skin-card-canvas-placeholder">
                            {skin.title}
                          </div>
                        )}
                      </div>
                      <h3 className="skin-card-name">{skin.title}</h3>
                      <p className="skin-card-category">{skin.category}</p>
                      <div className="skin-card-footer">
                        <a 
                          href={downloadUrl} 
                          className="skin-card-download" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Скачать
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Компонент пагинации */}
              {last_page > 1 && (
                <Pagination 
                  currentPage={current_page} 
                  totalPages={last_page} 
                  category={category} 
                />
              )}
            </>
          )}
        </div>
      </PageSection>
    </div>
  );
}