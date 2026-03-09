import { PageSection } from "../components/PageSection";
import { skinsApi, type SkinPost, resolveAssetUrl, getBaseUrl } from "@/lib/api";

export const metadata = {
  title: "Скины — RuCraft",
  description: "Скины для Minecraft: смешные, для девочек, для мальчиков, аниме, мобы, ютуберы. Фото и развёртка для скачивания.",
};

const apiErrorMessage = (
  <p className="form-error">
    Не удалось загрузить данные. Убедитесь, что бэкенд запущен (<code>php artisan serve</code>) и в <code>.env.local</code> указан <code>NEXT_PUBLIC_API_URL</code> (например, http://localhost:8000/api).
  </p>
);

async function getSkins(): Promise<{ data: SkinPost[]; error?: boolean }> {
  try {
    const res = await skinsApi.index();
    return { data: res.data };
  } catch (err) {
    console.error("Skins fetch failed:", err);
    return { data: [], error: true };
  }
}

export default async function SkinsPage() {
  const { data: skins, error: fetchFailed } = await getSkins();

  return (
    <div className="page-content">
      <PageSection title="Скины">
        {fetchFailed ? (
          apiErrorMessage
        ) : skins.length === 0 ? (
          <p>Скинов пока нет.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {skins.map((skin) => {
              const imageSrc = resolveAssetUrl(skin.image) ?? "/placeholder-skin.png";
              const downloadUrl = `${getBaseUrl().replace(/\/$/, "")}/skins/${skin.id}/download`;

              return (
                <article key={skin.id} className="card">
                  <div className="card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt={skin.title} />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{skin.title}</h3>
                    <p className="card-meta">
                      Автор: <strong>{skin.author.name}</strong>
                    </p>
                    <p className="card-text">Категория: {skin.category}</p>
                    <a
                      href={downloadUrl}
                      className="btn-primary mt-3 inline-flex"
                      download
                    >
                      скачать
                    </a>
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
