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

async function getSkins(params: {
  page?: number;
  category?: string;
}): Promise<
  | { data: SkinPost[]; current_page: number; last_page: number; total: number; error?: false }
  | { data: []; error: true }
> {
  try {
    const res = await skinsApi.index({
      page: params.page ?? 1,
      category: params.category || undefined,
    });
    return {
      data: res.data,
      current_page: res.current_page,
      last_page: res.last_page,
      total: res.total,
    };
  } catch (err) {
    console.error("Skins fetch failed:", err);
    return { data: [], error: true as const };
  }
}

export default async function SkinsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params?.page ?? "1"), 10) || 1);
  const category = params?.category ?? "";

  const result = await getSkins({ page, category: category || undefined });
  const fetchFailed = "error" in result && result.error;
  const skins = result.data;
  const currentPage = fetchFailed ? 1 : result.current_page;
  const lastPage = fetchFailed ? 1 : result.last_page;
  const total = fetchFailed ? 0 : result.total;

  return (
    <div className="page-content">
      <PageSection title="Скины">
        <SkinsToolbar />

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
