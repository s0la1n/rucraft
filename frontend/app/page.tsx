import Link from "next/link";
import { BackendStatus } from "./components/BackendStatus";

export default function Home() {
  return (
    <>
      {/* 1. Баннер со слайдером */}
      <section className="hero-slider">
        <div className="hero-slider-track">
          <div className="hero-slide hero-slide-1" />
          <div className="hero-slide hero-slide-2" />
          <div className="hero-slide hero-slide-3" />
        </div>
        <div className="hero-overlay">
          <h1 className="hero-title">Самый лучший сайт</h1>
          <Link href="/auth/register" className="hero-cta">
            Зарегистрироваться
          </Link>
        </div>
      </section>

      <div className="page-content">
        <BackendStatus />
      </div>

      {/* 2. Блок Постройки */}
      <section className="home-section">
        <h2 className="section-title">Постройки</h2>
        <div className="builds-grid">
          <div className="build-card-placeholder">Постройка 1</div>
          <div className="build-card-placeholder">Постройка 2</div>
          <div className="build-card-placeholder">Постройка 3</div>
        </div>
        <div className="section-cta-wrap">
          <Link href="/builds" className="btn-section">
            Посмотреть постройки
          </Link>
        </div>
      </section>

      {/* 3. Блок Скины */}
      <section className="home-section">
        <h2 className="section-title">Скины</h2>
        <div className="skins-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skin-card">
              <div className="skin-card-image">Скин {i}</div>
              <div className="skin-card-title">Карточка скина {i}</div>
            </div>
          ))}
        </div>
        <div className="section-cta-wrap">
          <Link href="/skins" className="btn-section">
            Посмотреть скины
          </Link>
        </div>
      </section>

      {/* 4. Блок Сиды */}
      <section className="home-section">
        <h2 className="section-title">Сиды</h2>
        <div className="seed-screenshot">Скриншот из игры</div>
        <div className="section-cta-wrap">
          <Link href="/seeds" className="btn-section">
            Посмотреть сиды
          </Link>
        </div>
      </section>

      {/* 5. Блок Моды */}
      <section className="home-section">
        <h2 className="section-title">Моды</h2>
        <div className="mods-block">
          <p>
            Скачивайте моды для Minecraft: Java, Bedrock и универсальные. Описание, скриншоты и файлы в одном месте.
          </p>
        </div>
        <div className="section-cta-wrap">
          <Link href="/mods" className="btn-section">
            Подробнее
          </Link>
        </div>
      </section>
    </>
  );
}
