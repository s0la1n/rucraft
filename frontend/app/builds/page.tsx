import { Suspense } from "react";
import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { buildsApi, type BuildPost, resolveStorageUrl } from "@/lib/api";
import { BuildsToolbar } from "./BuildsToolbar";

export const metadata = {
  title: "Постройки — RuCraft",
  description: "Постройки для Minecraft: название, фото, список блоков и количество, видео.",
};

async function getBuilds(): Promise<{ data: BuildPost[]; error?: boolean }> {
  try {
    const res = await buildsApi.index();
    return { data: res.data };
  } catch (err) {
    console.error("Builds fetch failed:", err);
    return { data: [], error: true };
  }
}

export default async function BuildsPage() {
  const { data: builds, error: fetchFailed } = await getBuilds();

  return (
    <div className="page-content">
      <PageSection title="Постройки">
        <Suspense fallback={null}>
          <BuildsToolbar />
        </Suspense>
        {fetchFailed ? (
          <p className="form-error">
            Не удалось загрузить данные. Убедитесь, что бэкенд запущен (<code>php artisan serve</code>) и в <code>.env.local</code> указан <code>NEXT_PUBLIC_API_URL</code> (например, http://localhost:8000/api).
          </p>
        ) : builds.length === 0 ? (
          <p>Построек пока нет.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {builds.map((build) => {
              const imageSrc =
                build.image_url ??
                resolveStorageUrl(build.image) ??
                "/placeholder-build.png";
              return (
                <article key={build.id} className="card">
                  <div className="card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt={build.title} />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{build.title}</h3>
                    <p className="card-meta">
                      Автор: <strong>{build.author.name}</strong>
                    </p>
                    {build.description && <p className="card-text line-clamp-3">{build.description}</p>}
                    <Link href={`/builds/${build.id}`} className="btn-link mt-3 inline-flex">
                      Подробнее
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PageSection>
    </div>
  );
}