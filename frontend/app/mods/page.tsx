import { Suspense } from "react";
import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { modsApi, type ModPost, type ModsIndexResponse, resolveAssetUrl } from "@/lib/api";
import { ModsToolbar } from "./ModsToolbar";

export const metadata = {
  title: "Моды — RuCraft",
  description: "Моды для Minecraft: название, фото, описание, zip или rar файл.",
};

const apiErrorMessage = (
  <p className="form-error">
    Не удалось загрузить данные. Убедитесь, что бэкенд запущен (<code>php artisan serve</code>) и в <code>.env.local</code> указан <code>NEXT_PUBLIC_API_URL</code> (например, http://localhost:8000/api).
  </p>
);

async function getMods(params: { 
  page?: number; 
  version?: string; 
  minecraft_version?: string;
  search?: string;
}): Promise<{ data: ModPost[]; current_page: number; last_page: number; total: number; error?: boolean }> {
  try {
    // Передаем params в API
    const response = await modsApi.index(params);
    
    // АДАПТЕР: преобразуем ответ API в нужную структуру
    // Проверяем, что response не undefined и имеет нужную структуру
    if (response && typeof response === 'object') {
      // Если response уже имеет структуру ModsIndexResponse
      if ('data' in response && Array.isArray(response.data)) {
        return {
          data: response.data as ModPost[],
          current_page: (response as any).current_page || 1,
          last_page: (response as any).last_page || 1,
          total: (response as any).total || response.data.length,
          error: false
        };
      }
      
      // Если response это просто массив модов (на всякий случай)
      if (Array.isArray(response)) {
        return {
          data: response as ModPost[],
          current_page: 1,
          last_page: 1,
          total: response.length,
          error: false
        };
      }
    }
    
    // Если ничего не подошло, возвращаем пустую структуру
    console.warn("Unexpected API response format:", response);
    return { 
      data: [], 
      current_page: 1, 
      last_page: 1, 
      total: 0, 
      error: true 
    };
    
  } catch (err) {
    console.error("Mods fetch failed:", err);
    return { 
      data: [], 
      current_page: 1, 
      last_page: 1, 
      total: 0, 
      error: true 
    };
  }
}

type SearchParams = Promise<{ 
  page?: string; 
  version?: string; 
  minecraft_version?: string;
  search?: string;
}> | { 
  page?: string; 
  version?: string; 
  minecraft_version?: string;
  search?: string;
};

export default async function ModsPage(props: { searchParams?: SearchParams }) {
  const searchParams = props.searchParams instanceof Promise 
    ? await props.searchParams 
    : (props.searchParams ?? {});
  
  const page = Math.max(1, parseInt(String(searchParams.page || "1"), 10) || 1);
  const version = searchParams.version ?? "";
  const minecraftVersion = searchParams.minecraft_version ?? "";
  const search = searchParams.search ?? "";

  const modsData = await getMods({ 
    page, 
    version: version || undefined,
    minecraft_version: minecraftVersion || undefined,
    search: search || undefined
  });
  
  const { data: mods, current_page, last_page, error: fetchFailed } = modsData;

  return (
    <div className="page-content">
      <PageSection title="Моды">
        <div className="mods-list-page">
          <Suspense fallback={null}>
            <ModsToolbar />
          </Suspense>

          {fetchFailed ? (
            apiErrorMessage
          ) : mods.length === 0 ? (
            <p>Модов пока нет.</p>
          ) : (
            <>
              {/* Твои карточки */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {mods.map((mod) => {
                  const imageSrc =
                    mod.image_url ??
                    resolveAssetUrl(mod.image) ??
                    "/placeholder-mod.png";
                  return (
                    <article key={mod.id} className="card">
                      <div className="card-image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageSrc} alt={mod.title} />
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{mod.title}</h3>
                        <p className="card-meta">
                          Автор: <strong>{mod.author.name}</strong>
                        </p>
                        <div className="mod-badges" style={{ marginBottom: '10px' }}>
                          {mod.version && (
                            <span className="badge">{mod.version}</span>
                          )}
                          {mod.minecraft_version && (
                            <span className="badge">MC {mod.minecraft_version}</span>
                          )}
                        </div>
                        {mod.description && <p className="card-text line-clamp-3">{mod.description}</p>}
                        <Link href={`/mods/${mod.id}`} className="btn-link mt-3 inline-flex">
                          Подробнее
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Пагинация */}
              {last_page > 1 && (
                <nav className="pagination">
                  {current_page > 1 && (
                    <a href={`/mods?page=${current_page - 1}${version ? `&version=${encodeURIComponent(version)}` : ''}${minecraftVersion ? `&minecraft_version=${encodeURIComponent(minecraftVersion)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`} className="page-arrow">
                      &lt;
                    </a>
                  )}
                  <span className="page-current">
                    {current_page} / {last_page}
                  </span>
                  {current_page < last_page && (
                    <a href={`/mods?page=${current_page + 1}${version ? `&version=${encodeURIComponent(version)}` : ''}${minecraftVersion ? `&minecraft_version=${encodeURIComponent(minecraftVersion)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`} className="page-arrow">
                      &gt;
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