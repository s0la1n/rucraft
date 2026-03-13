"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { seedsApi, type SeedPost, resolveStorageUrl } from "@/lib/api";

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
        console.log('API Response:', response.data); // Для отладки
        setSeed(response.data);
        
        // Парсим координаты из JSON-строки
        if (response.data.coordinates) {
          try {
            // Проверяем тип и парсим соответственно
            if (typeof response.data.coordinates === 'string') {
              const parsed = JSON.parse(response.data.coordinates);
              setCoordinates(Array.isArray(parsed) ? parsed : []);
            } else if (Array.isArray(response.data.coordinates)) {
              setCoordinates(response.data.coordinates);
            } else if (response.data.coordinates && typeof response.data.coordinates === 'object') {
              // Если это одиночный объект координат
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
    <div className="page-content">
      <PageSection title={seed ? seed.title : "Сид"}>
        {loading && <p>Загрузка…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && seed && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p>
                Автор: <strong>{seed.author.name}</strong>
              </p>
              <p>
                Номер сида: <code>{seed.seed}</code>
              </p>
              <p>
                Версия: <strong>{seed.version}</strong>, релиз: <strong>{seed.release}</strong>
              </p>
              
              {/* Отображаем все координаты */}
              {coordinates.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mt-4 mb-2">Интересные места:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {coordinates.map((coord, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{coord.name}:</span>{" "}
                        x = {coord.x}, y = {coord.y}, z = {coord.z}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>
                  Координаты: x = {seed.x || 0}, y = {seed.y || 0}, z = {seed.z || 0}
                </p>
              )}
            </div>

            {seed.images && seed.images.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-6">
                {seed.images.map((src) => {
                  const resolved = resolveStorageUrl(src) ?? src;
                  return (
                    <div key={src} className="overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolved} alt={seed.title} className="h-full w-full object-cover" />
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