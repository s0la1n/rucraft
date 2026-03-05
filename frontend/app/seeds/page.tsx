import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { seedsApi, type SeedPost } from "@/lib/api";

export const metadata = {
  title: "Сиды — RuCraft",
  description: "Сиды для Minecraft: название, номер сида, версия, релиз, координаты.",
};

async function getSeeds(): Promise<SeedPost[]> {
  const res = await seedsApi.index();
  return res.data;
}

export default async function SeedsPage() {
  const seeds = await getSeeds();

  return (
    <div className="page-content">
      <PageSection title="Сиды">
        {seeds.length === 0 ? (
          <p>Сидов пока нет.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {seeds.map((seed) => (
              <article key={seed.id} className="card">
                <div className="card-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={seed.image ?? "/placeholder-seed.png"} alt={seed.title} />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{seed.title}</h3>
                  <p className="card-meta">
                    Автор: <strong>{seed.author.name}</strong>
                  </p>
                  <p className="card-text">
                    Сид: <code>{seed.seed}</code>
                  </p>
                  <p className="card-text">
                    Версия: {seed.version}, релиз: {seed.release}
                  </p>
                  <Link href={`/seeds/${seed.id}`} className="btn-link mt-3 inline-flex">
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
