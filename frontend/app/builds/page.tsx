import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { buildsApi, type BuildPost } from "@/lib/api";

export const metadata = {
  title: "Постройки — RuCraft",
  description: "Постройки для Minecraft: название, фото, список блоков и количество, видео.",
};

async function getBuilds(): Promise<BuildPost[]> {
  const res = await buildsApi.index();
  return res.data;
}

export default async function BuildsPage() {
  const builds = await getBuilds();

  return (
    <div className="page-content">
      <PageSection title="Постройки">
        {builds.length === 0 ? (
          <p>Построек пока нет.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {builds.map((build) => (
              <article key={build.id} className="card">
                <div className="card-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={build.image ?? "/placeholder-build.png"} alt={build.title} />
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
            ))}
          </div>
        )}
      </PageSection>
    </div>
  );
}
