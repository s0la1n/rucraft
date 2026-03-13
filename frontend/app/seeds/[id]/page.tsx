"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { seedsApi, type SeedPost, resolveStorageUrl } from "@/lib/api";
import styles from "./seed.module.css";

type Coordinates = {
  name: string;
  x: number;
  y: number;
  z: number;
};

export default function SeedShowPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [seed, setSeed] = useState<SeedPost | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Некорректный идентификатор сида.");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    seedsApi
      .show(id)
      .then((response) => {
        console.log('API Response:', response.data);
        setSeed(response.data);
        
        if (response.data.coordinates) {
          try {
            if (typeof response.data.coordinates === 'string') {
              const parsed = JSON.parse(response.data.coordinates);
              setCoordinates(Array.isArray(parsed) ? parsed : []);
            } else if (Array.isArray(response.data.coordinates)) {
              setCoordinates(response.data.coordinates);
            } else if (response.data.coordinates && typeof response.data.coordinates === 'object') {
              setCoordinates([response.data.coordinates as Coordinates]);
            }
          } catch (e) {
            console.error('Failed to parse coordinates:', e);
            setCoordinates([]);
          }
        }
      })
      .catch((err) => {
        console.error('Error loading seed:', err);
        setError("Не удалось загрузить сид.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <div className={styles.pageContent}>
      <PageSection title={seed ? seed.title : "Сид"}>
        {loading && <p className={styles.loading}>Загрузка…</p>}
        {error && <p className={styles.formError}>{error}</p>}
        {!loading && !error && seed && (
          <div className={styles.spaceY4}>
            <div className={styles.spaceY2}>
              <p className={styles.infoText}>
                Автор: <strong>{seed.author.name}</strong>
              </p>
              <p className={styles.infoText}>
                Номер сида: <code>{seed.seed}</code>
              </p>
              <p className={styles.infoText}>
                Версия: <strong>{seed.version}</strong>, релиз: <strong>{seed.release}</strong>
              </p>
              
              {/* Отображаем все координаты */}
              {coordinates.length > 0 ? (
                <div className={styles.coordinatesSection}>
                  <h3 className={styles.coordinatesTitle}>Интересные места:</h3>
                  <ul className={styles.coordinatesList}>
                    {coordinates.map((coord, index) => (
                      <li key={index} className={styles.coordinatesItem}>
                        <span className={styles.coordinatesName}>{coord.name}:</span>{" "}
                        <span className={styles.coordinatesValues}>
                          x = {coord.x}, y = {coord.y}, z = {coord.z}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className={styles.infoText}>
                  Координаты: x = {seed.x || 0}, y = {seed.y || 0}, z = {seed.z || 0}
                </p>
              )}
            </div>

            {seed.images && seed.images.length > 0 && (
              <div className={styles.grid}>
                {seed.images.map((src) => {
                  const resolved = resolveStorageUrl(src) ?? src;
                  return (
                    <div key={src} className={styles.imageContainer}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolved} alt={seed.title} className={styles.image} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PageSection>
    </div>
  );
}