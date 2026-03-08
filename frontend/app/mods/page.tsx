import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { modsApi, type ModPost } from "@/lib/api";

export const metadata = {
  title: "Моды — RuCraft",
  description: "Моды для Minecraft: название, фото, описание, zip или rar файл.",
};

async function getMods(): Promise<ModPost[]> {
  const res = await modsApi.index();
  return res.data;
}

export default async function ModsPage() {
  const mods = await getMods();

  return (
    <div className="page-content">
      <PageSection title="Моды">
        {mods.length === 0 ? (
          <p>Модов пока нет.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {mods.map((mod) => (
              <article key={mod.id} className="card">
                <div className="card-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mod.image ?? "/placeholder-mod.png"} alt={mod.title} />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{mod.title}</h3>
                  <p className="card-meta">
                    Автор: <strong>{mod.author.name}</strong>
                  </p>
                  {mod.description && <p className="card-text line-clamp-3">{mod.description}</p>}
                  <Link href={`/mods/${mod.id}`} className="btn-link mt-3 inline-flex">
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
