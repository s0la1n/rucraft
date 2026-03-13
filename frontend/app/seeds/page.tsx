import { Suspense } from "react";
import Link from "next/link";
import { PageSection } from "../components/PageSection";
import { seedsApi, type SeedPost, resolveAssetUrl, resolveStorageUrl } from "@/lib/api";
import { SeedsToolbar } from "./SeedsToolbar";
import MinecraftSeedGenerator from "../components/MinecraftSeedGenerator";
import styles from './seeds.module.css';

export const metadata = {
  title: "Сиды — RuCraft",
  description: "Сиды для Minecraft: название, номер сида, версия, релиз, координаты.",
};

const apiErrorMessage = (
  <p className={styles.formError}>
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

export default async function SeedsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const { data: seeds, error: fetchFailed } = await getSeeds();
  
  // Пагинация
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 6;
  const totalPages = Math.ceil(seeds.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentSeeds = seeds.slice(start, end);

  return (
    <div className={styles.pageContent}>
      <PageSection title="Сиды">
        <Suspense fallback={null}>
          <SeedsToolbar />
        </Suspense>
        
        <div className={styles.mb6}>
          <Link href="/seeds/map" className={styles.btnLinkLarge}>
            Открыть карту сидов
          </Link>
        </div>

        {fetchFailed ? (
          apiErrorMessage
        ) : seeds.length === 0 ? (
          <p>Сидов пока нет.</p>
        ) : (
          <>
            <div className={styles.mb8}>
              <MinecraftSeedGenerator />
            </div>

            {/* Сетка с текущей страницей */}
            <div className={styles.grid}>
              {currentSeeds.map((seed) => {
                const imageSrc = 
                  seed.image_url ?? 
                  resolveStorageUrl(seed.image) ?? 
                  resolveAssetUrl(seed.image) ?? 
                  "/placeholder-seed.png";
                  
                return (
                  <article key={seed.id} className={styles.card}>
                    <div className={styles.cardImage}>
                      <img src={imageSrc} alt={seed.title} />
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{seed.title}</h3>
                      <p className={styles.cardMeta}>
                        Автор: <strong>{seed.author.name}</strong>
                      </p>
                      <p className={styles.cardText}>
                        Сид: <code>{seed.seed}</code>
                      </p>
                      <p className={styles.cardText}>
                        Версия: {seed.version}, релиз: {seed.release}
                      </p>
                      <Link href={`/seeds/${seed.id}`} className={`${styles.btnLink} ${styles.mt3}`}>
                        Подробнее
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                {currentPage > 1 && (
                  <Link 
                    href={`/seeds?page=${currentPage - 1}`} 
                    className={styles.paginationBtn}
                  >
                    ← Назад
                  </Link>
                )}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Link
                    key={page}
                    href={`/seeds?page=${page}`}
                    className={`${styles.paginationBtn} ${page === currentPage ? styles.activePage : ''}`}
                  >
                    {page}
                  </Link>
                ))}

                {currentPage < totalPages && (
                  <Link 
                    href={`/seeds?page=${currentPage + 1}`} 
                    className={styles.paginationBtn}
                  >
                    Вперед →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </PageSection>
    </div>
  );
}