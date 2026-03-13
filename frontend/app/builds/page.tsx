import { Suspense } from "react";
import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { buildsApi, type BuildPost, resolveStorageUrl } from "@/lib/api";
import { BuildsToolbar } from "./BuildsToolbar";
import "./builds.css";

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
        <div className="builds-list-page">
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
            <div className="builds-grid">
              {builds.map((build) => {
                const imageSrc =
                  build.image_url ??
                  resolveStorageUrl(build.image) ??
                  "/placeholder-build.png";
                return (
                  <article key={build.id} className="build-card">
                    <div className="build-card-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageSrc} alt={build.title} />
                    </div>
                    <div className="build-card-body">
                      <h3 className="build-card-title">{build.title}</h3>
                      <p className="build-card-meta">
                        Автор: <strong>{build.author.name}</strong>
                      </p>
                      {build.description && <p className="build-card-text line-clamp-3">{build.description}</p>}
                      <Link href={`/builds/${build.id}`} className="build-card-btn">
                        Подробнее
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </PageSection>
    </div>
  );
}