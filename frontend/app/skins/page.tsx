import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { skinsApi, type SkinPost } from "@/lib/api";

export const metadata = {
  title: "Скины — RuCraft",
  description: "Скины для Minecraft: смешные, для девочек, для мальчиков, аниме. Фото и развёртка для скачивания.",
};

async function getSkins(): Promise<SkinPost[]> {
  const res = await skinsApi.index();
  return res.data;
}

export default async function SkinsPage() {
  const skins = await getSkins();

  return (
    <div className="page-content">
      <PageSection title="Скины">
        {skins.length === 0 ? (
          <p>Скинов пока нет.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {skins.map((skin) => (
              <article key={skin.id} className="card">
                <div className="card-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={skin.image ?? "/placeholder-skin.png"} alt={skin.title} />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{skin.title}</h3>
                  <p className="card-meta">
                    Автор: <strong>{skin.author.name}</strong>
                  </p>
                  <p className="card-text">Категория: {skin.category}</p>
                  <Link href={`/skins/${skin.id}`} className="btn-link mt-3 inline-flex">
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
