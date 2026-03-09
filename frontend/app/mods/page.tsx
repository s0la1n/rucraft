import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { modsApi, type ModPost, resolveAssetUrl } from "@/lib/api";

export const metadata = {
  title: "Моды — RuCraft",
  description: "Моды для Minecraft: название, фото, описание, zip или rar файл.",
};

const apiErrorMessage = (
  <p className="form-error">
    Не удалось загрузить данные. Убедитесь, что бэкенд запущен (<code>php artisan serve</code>) и в <code>.env.local</code> указан <code>NEXT_PUBLIC_API_URL</code> (например, http://localhost:8000/api).
  </p>
);

async function getMods(): Promise<{ data: ModPost[]; error?: boolean }> {
  try {
    const res = await modsApi.index();
    return { data: res.data };
  } catch (err) {
    console.error("Mods fetch failed:", err);
    return { data: [], error: true };
  }
}

export default async function ModsPage() {
  const { data: mods, error: fetchFailed } = await getMods();

  return (
    <div className="page-content">
      <PageSection title="Моды">
        {fetchFailed ? (
          apiErrorMessage
        ) : mods.length === 0 ? (
          <p>Модов пока нет.</p>
        ) : (
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
                  {mod.description && <p className="card-text line-clamp-3">{mod.description}</p>}
                    <Link href={`/mods/${mod.id}`} className="btn-link mt-3 inline-flex">
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
