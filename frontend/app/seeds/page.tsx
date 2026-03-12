import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { seedsApi, type SeedPost, resolveAssetUrl } from "@/lib/api";
import MinecraftSeedGenerator from "../components/MinecraftSeedGenerator"; 

export const metadata = {
  title: "Сиды — RuCraft",
  description: "Сиды для Minecraft: название, номер сида, версия, релиз, координаты.",
};

const apiErrorMessage = (
  <p className="form-error">
    Не удалось загрузить данные. Убедитесь, что бэкенд запущен (<code>php artisan serve</code>) и в <code>.env.local</code> указан <code>NEXT_PUBLIC_API_URL</code> (например, http://localhost:8000/api).
  </p>
);

async function getSeeds(): Promise<{ data: SeedPost[]; error?: boolean }> {
  try {
    const res = await seedsApi.index();
    return { data: res.data };
  } catch (err) {
    console.error("Seeds fetch failed:", err);
    return { data: [], error: true };
  }
}

export default async function SeedsPage() {
  const { data: seeds, error: fetchFailed } = await getSeeds();

  return (
    <div className="page-content">
      <PageSection title="Сиды">
        <div className="mb-6">
          <Link href="/seeds/map" className="btn-link inline-flex">
            Открыть карту сидов
          </Link>
        </div>
        {fetchFailed ? (
          apiErrorMessage
        ) : seeds.length === 0 ? (
          <p>Сидов пока нет.</p>
        ) : (
           
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="mb-8">
              <MinecraftSeedGenerator />
            </div>
              {seeds.map((seed) => {
                const imageSrc =
                  seed.image_url ??
                  resolveAssetUrl(seed.image) ??
                  "/placeholder-seed.png";
                return (
                  <article key={seed.id} className="card">
                    <div className="card-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageSrc} alt={seed.title} />
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
                );
              })}
            </div>
        )}
      </PageSection>
    </div>
  );
}
