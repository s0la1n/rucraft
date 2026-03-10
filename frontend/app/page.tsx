import Link from "next/link";
import { BackendStatus } from "./components/BackendStatus";
import { HeroSlider } from "./components/HeroSlider";
import {
  buildsApi,
  modsApi,
  seedsApi,
  skinsApi,
  type BuildPost,
  type ModPost,
  type SeedPost,
  type SkinPost,
  resolveAssetUrl,
} from "@/lib/api";

async function getHomeData(): Promise<{
  builds: BuildPost[];
  mods: ModPost[];
  seeds: SeedPost[];
  skins: SkinPost[];
}> {
  try {
    const [buildsRes, modsRes, seedsRes, skinsRes] = await Promise.all([
      buildsApi.index(),
      modsApi.index(),
      seedsApi.index(),
      skinsApi.index({ page: 1 }),
    ]);

    return {
      builds: buildsRes.data.slice(0, 3),
      mods: modsRes.data.slice(0, 2),
      seeds: seedsRes.data.slice(0, 1),
      skins: skinsRes.data.slice(0, 4),
    };
  } catch (err) {
    console.error("Home data fetch failed:", err);
    return { builds: [], mods: [], seeds: [], skins: [] };
  }
}

export default async function Home() {
  const { builds, mods, seeds, skins } = await getHomeData();
  const firstSeed = seeds[0];

  return (
    <>
      <HeroSlider />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <BackendStatus />
      </main>

      {/* Блок Постройки: данные из BuildSeeder */}
      <section className="builds-block">
        <h2 className="builds-title">ПОСТРОЙКИ</h2>
        <div className="builds-gallery">
          {builds.length === 0 ? (
            <p className="form-error">Постройки пока не загружены.</p>
          ) : (
            builds.map((build, index) => {
              const imageSrc =
                build.image_url ?? resolveAssetUrl(build.image) ?? "/placeholder-build.png";
              const wrapClass =
                index === 0
                  ? "builds-img-wrap builds-img-1"
                  : index === 1
                  ? "builds-img-wrap builds-img-2"
                  : "builds-img-wrap builds-img-3";

              return (
                <div key={build.id} className={wrapClass}>
                  <Link href={`/builds/${build.id}`} className="builds-img-placeholder">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt={build.title} />
                  </Link>
                  {index === 0 && (
                    <div className="builds-more-wrap">
                      <Link href="/builds" className="builds-more-btn">
                        БОЛЬШЕ &gt;&gt;&gt;
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Блок cRbys: первые 4 скина */}
      <section className="skins-block">
        <h2 className="section-title-cyan">cRbys</h2>
        <div className="skins-cards-row">
          {skins.length === 0 ? (
            <p className="form-error">Скины пока не загружены.</p>
          ) : (
            skins.map((skin) => {
              const imageSrc = resolveAssetUrl(skin.image) ?? "/placeholder-skin.png";
              return (
                <Link
                  key={skin.id}
                  href={`/skins/${skin.id}`}
                  className="skin-card-main"
                >
                  <div className="builds-img-placeholder">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt={skin.title} />
                  </div>
                </Link>
              );
            })
          )}
        </div>
        <div className="skins-buttons-row">
          <Link href="/skins" className="skins-btn-more">
            БОЛЬШЕ &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;
          </Link>
          <Link href="/skins" className="skins-btn-all">
            ВСЕ СКИНЫ &gt;&gt;&gt;&gt;&gt;
          </Link>
        </div>
      </section>

      {/* Блок СИДЫ: первый сид */}
      <section className="seeds-block">
        <h2 className="section-title-cyan">СИДЫ</h2>
        <div className="seeds-slider-wrap">
          <div className="seeds-slider-track">
            {firstSeed ? (
              <div className="seeds-slide">
                <Link
                  href={`/seeds/${firstSeed.id}`}
                  className="builds-img-placeholder seeds-slide-bg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      firstSeed.image_url ??
                      resolveAssetUrl(firstSeed.image) ??
                      "/placeholder-seed.png"
                    }
                    alt={firstSeed.title}
                  />
                </Link>
                <div className="seeds-slide-info">
                  <div className="seeds-slide-number">{firstSeed.seed}</div>
                  <div className="seeds-slide-name">{firstSeed.title}</div>
                </div>
                <div className="seeds-more-wrap">
                  <Link href={`/seeds`} className="builds-more-btn">
                    БОЛЬШЕ &gt;&gt;&gt;
                  </Link>
                </div>
              </div>
            ) : (
              <p className="form-error">Сиды пока не загружены.</p>
            )}
          </div>
          <button type="button" className="seeds-nav-btn prev" aria-label="Предыдущий" />
          <button type="button" className="seeds-nav-btn next" aria-label="Следующий" />
        </div>
      </section>

      {/* Блок моДЫ: первые 2 мода */}
      <section className="mods-block-home">
        <h2 className="section-title-cyan">моДЫ</h2>
        <div className="mods-images-row">
          {mods.length === 0 ? (
            <p className="form-error">Моды пока не загружены.</p>
          ) : (
            mods.map((mod, index) => {
              const imageSrc =
                mod.image_url ?? resolveAssetUrl(mod.image) ?? "/placeholder-mod.png";
              const labelClass =
                index === 0 ? "mods-img-label-left" : "mods-img-label-right";
              const labelText =
                index === 0 ? (
                  <>ХОРРОРЫ</>
                ) : (
                  <>
                    ИНДУСТ<br />
                    иаль<br />
                    ные
                  </>
                );

              return (
                <div key={mod.id} className="mods-img-wrap">
                  <Link href={`/mods/${mod.id}`} className="builds-img-placeholder mods-img-fill">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageSrc} alt={mod.title} />
                  </Link>
                  <span className={labelClass}>{labelText}</span>
                </div>
              );
            })
          )}
          <Link href="/mods" className="mods-more-full">
            БОЛЬШЕ &gt;&gt;&gt;
          </Link>
        </div>
      </section>
    </>
  );
}
