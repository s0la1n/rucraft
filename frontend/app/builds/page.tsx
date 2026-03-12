import { Suspense } from "react";
import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { buildsApi, type BuildPost, resolveAssetUrl } from "@/lib/api";
import { BuildsToolbar } from "./BuildsToolbar";
import "./builds.css";

export const metadata = {
  title: "Постройки — RuCraft",
  description: "Постройки для Minecraft: название, фото, список блоков и количество, видео.",
};

const apiErrorMessage = (
  <p className="form-error">
    Не удалось загрузить данные. Убедитесь, что бэкенд запущен (<code>php artisan serve</code>) и в <code>.env.local</code> указан <code>NEXT_PUBLIC_API_URL</code> (например, http://localhost:8000/api).
  </p>
);

async function getBuilds(params: { 
  page?: number; 
  difficulty?: string;
  search?: string;
}): Promise<{ data: BuildPost[]; current_page: number; last_page: number; total: number; error?: boolean }> {
  try {
    const res = await buildsApi.index(params);
    return res;
  } catch (err) {
    console.error("Builds fetch failed:", err);
    return { data: [], current_page: 1, last_page: 1, total: 0, error: true };
  }
}

type SearchParams = Promise<{ 
  page?: string; 
  difficulty?: string;
  search?: string;
}> | { 
  page?: string; 
  difficulty?: string;
  search?: string;
};

export default async function BuildsPage(props: { searchParams?: SearchParams }) {
  const searchParams = props.searchParams instanceof Promise 
    ? await props.searchParams 
    : (props.searchParams ?? {});
  
  const page = Math.max(1, parseInt(String(searchParams.page || "1"), 10) || 1);
  const difficulty = searchParams.difficulty ?? "";
  const search = searchParams.search ?? "";

  const buildsData = await getBuilds({ 
    page, 
    difficulty: difficulty || undefined,
    search: search || undefined
  });
  
  const { data: builds, current_page, last_page, error: fetchFailed } = buildsData;

  return (
    <div className="page-content">
      <PageSection title="Постройки">
        <div className="builds-list-page">
          <Suspense fallback={null}>
            <BuildsToolbar />
          </Suspense>

          {fetchFailed ? (
            apiErrorMessage
          ) : builds.length === 0 ? (
            <p>Построек пока нет.</p>
          ) : (
            <>
              <div className="builds-grid">
                {builds.map((build: BuildPost) => {
                  const imageSrc =
                    build.image_url ??
                    resolveAssetUrl(build.image) ??
                    "/placeholder-build.png";
                  return (
                    <article key={build.id} className="build-card">
                      <div className="build-card-image">
                        <img src={imageSrc} alt={build.title} />
                      </div>
                      <div className="build-card-content">
                        <h3 className="build-card-title">{build.title}</h3>
                        <div className="build-card-info">
                           <p className="build-card-author">
                              Автор: <strong>{build.author.name}</strong>
                          </p>
                          <div className="build-card-badges">
                            {build.minecraft_version && (
                              <span className="badge">MC {build.minecraft_version}</span>
                            )}
                            {build.difficulty && (
                              <span className="badge">{build.difficulty}</span>
                            )}
                          </div>
                        </div>
                        
                        <Link href={`/builds/${build.id}`} className="build-card-link">
                          Подробнее
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {last_page > 1 && (
                <nav className="builds-pagination">
                  {current_page > 1 && (
                    <a 
                      href={`/builds?page=${current_page - 1}${difficulty ? `&difficulty=${encodeURIComponent(difficulty)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`} 
                      className="page-arrow"
                    >
                      &lt;
                    </a>
                  )}
                  <span className="page-current">
                    {current_page} / {last_page}
                  </span>
                  {current_page < last_page && (
                    <a 
                      href={`/builds?page=${current_page + 1}${difficulty ? `&difficulty=${encodeURIComponent(difficulty)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`} 
                      className="page-arrow"
                    >
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