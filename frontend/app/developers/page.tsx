"use client";

import { useEffect, useState } from "react";
import "./developers-slider.css";

type Developer = {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  telegram: string | null;
  vk: string | null;
  skin_url: string | null;
};

const sliderImages = [
  "developers/разработчики_слайдер1.png",
  "developers/разработчики_слайдер2.png",
  "developers/разработчики_слайдер3.png",
  "developers/разработчики_слайдер4.png",
  "developers/разработчики_слайдер5.png",
];

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"left" | "right" | "up" | "down">("right");
  const [nextSlideIndex, setNextSlideIndex] = useState(0);

  useEffect(() => {
    async function loadDevelopers() {
      try {
        const res = await fetch("http://localhost:8000/api/developers");
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        setDevelopers(json.data ?? []);
      } catch {
        // ignore
      }
    }

    loadDevelopers();
  }, []);

  function moveSlider(delta: number, direction: "left" | "right" | "up" | "down") {
    if (isAnimating) return;

    const total = sliderImages.length;
    const next = (sliderIndex + delta + total) % total;

    setAnimationDirection(direction);
    setNextSlideIndex(next);
    setIsAnimating(true);

    // ожидание окончания анимации 
    setTimeout(() => {
      setSliderIndex(next);
      setIsAnimating(false);
    }, 1500);
  }

  function sliderButtons() {
    return (
      <div className="slider-controls">
        <div className="slider-nav-row">
          <button
            type="button"
            onClick={() => moveSlider(-1, "left")}
            disabled={isAnimating}
            className="slider-nav-btn"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => moveSlider(1, "right")}
            disabled={isAnimating}
            className="slider-nav-btn"
          >
            →
          </button>
        </div>
        <div className="slider-nav-row">
          <button
            type="button"
            onClick={() => moveSlider(-1, "up")}
            disabled={isAnimating}
            className="slider-nav-btn"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveSlider(1, "down")}
            disabled={isAnimating}
            className="slider-nav-btn"
          >
            ↓
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
      <h1>Разработчики</h1>

      <section className="slider-section">
        {sliderButtons()}

        <div className="slider-container">
          {/* Текущий слайд с анимацией */}
          <div className={`slide-wrapper ${isAnimating ? `animate-${animationDirection}` : ""}`}>
            <img
              src={`http://localhost:8000/storage/${sliderImages[sliderIndex]}`}
              alt="Слайд разработчиков"
              className="slide-image"
            />

            {/* элементы для анимации складывания */}
            {isAnimating && (
              <>
                <div className="fold-corner top-left"></div>
                <div className="fold-corner top-right"></div>
                <div className="fold-corner bottom-left"></div>
                <div className="fold-corner bottom-right"></div>
                <div className="paper-plane">
                  <div className="plane-body"></div>
                  <div className="plane-wing"></div>
                  <div className="plane-tail"></div>
                </div>
              </>
            )}
          </div>

          {/* превью следующего слайда (показывается во время анимации) */}
          {isAnimating && (
            <div className="next-slide-preview">
              <img
                src={`http://localhost:8000/storage/${sliderImages[nextSlideIndex]}`}
                alt="Следующий слайд"
                className="slide-image preview"
              />
            </div>
          )}
        </div>
      </section>

      <section className="developers-section">
        {developers.length === 0 && <p>Разработчики пока не добавлены.</p>}

        {developers.map((developer) => (
          <article key={developer.id} className="developer-card">
            {developer.skin_url && (
              <div className="developer-skin">
                <img src={developer.skin_url} alt={`Скин ${developer.name}`} />
              </div>
            )}

            <div className="developer-info">
              <h3>{developer.name}</h3>
              <p className="developer-role">{developer.role}</p>
              {developer.bio && <p className="developer-bio">{developer.bio}</p>}

              {(developer.telegram || developer.vk) && (
                <div className="developer-social">
                  {developer.telegram && (
                    <div className="social-link">
                      <a
                        href={`https://t.me/${developer.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Telegram: {developer.telegram}
                      </a>
                    </div>
                  )}
                  {developer.vk && (
                    <div className="social-link">
                      <a
                        href={`https://vk.com/${developer.vk.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        VK: {developer.vk}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
