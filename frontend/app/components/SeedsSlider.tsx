"use client";

import { useState } from "react";
import Link from "next/link";
import type { SeedPost } from "@/lib/api";
import { resolveStorageUrl } from "@/lib/api";

type SeedsSliderProps = {
  seeds: SeedPost[];
};

export function SeedsSlider({ seeds }: SeedsSliderProps) {
  const visibleSeeds = seeds.slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasSeeds = visibleSeeds.length > 0;

  const currentSeed = visibleSeeds[currentIndex] ?? visibleSeeds[0];

  const handlePrev = () => {
    if (!hasSeeds) return;
    setCurrentIndex((prev) =>
      prev === 0 ? visibleSeeds.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!hasSeeds) return;
    setCurrentIndex((prev) =>
      prev === visibleSeeds.length - 1 ? 0 : prev + 1
    );
  };

  if (!hasSeeds || !currentSeed) {
    return (
      <section className="seeds-block">
        <h2 className="section-title-cyan">СИДЫ</h2>
        <p className="form-error">Сиды пока не загружены.</p>
      </section>
    );
  }

  const imageSrc =
    currentSeed.image_url ??
    resolveStorageUrl(currentSeed.image) ??
    "/placeholder-seed.png";

  return (
    <section className="seeds-block">
      <h2 className="section-title-cyan">СИДЫ</h2>
      <div className="seeds-slider-wrap">
        <div className="seeds-slider-track">
          <div className="seeds-slide">
            <Link
              href={`/seeds/${currentSeed.id}`}
              className="builds-img-placeholder seeds-slide-bg"
            >
              <img src={imageSrc} alt={currentSeed.title} />
            </Link>
            <div className="seeds-slide-info">
              <div className="seeds-slide-number">{currentSeed.seed}</div>
              <div className="seeds-slide-name">{currentSeed.title}</div>
            </div>
            <div className="seeds-more-wrap">
              <Link href={`/seeds`} className="builds-more-btn">
                БОЛЬШЕ &gt;&gt;&gt;
              </Link>
            </div>
          </div>
        </div>

        {visibleSeeds.length > 1 && (
          <>
            <button
              type="button"
              className="seeds-nav-btn prev"
              aria-label="Предыдущий сид"
              onClick={handlePrev}
            >
              <img 
                src="/developers/strelka.svg" 
                alt="Предыдущий сид"
                className="nav-arrow-icon nav-arrow-left"
              />
            </button>

            <button
              type="button"
              className="seeds-nav-btn next"
              aria-label="Следующий сид"
              onClick={handleNext}
            >
              <img 
                src="/developers/strelka.svg" 
                alt="Следующий сид"
                className="nav-arrow-icon"
              />
            </button>
          </>
        )}
      </div>
    </section>
  );
}