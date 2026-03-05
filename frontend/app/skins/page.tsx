import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Скины — RuCraft",
  description: "Скины для Minecraft: смешные, для девочек, для мальчиков, аниме. Фото и развёртка для скачивания.",
};

export default function SkinsPage() {
  return (
    <div className="page-content">
      <PageSection title="Скины">
        <p>
          Здесь пользователи выкладывают скины: фото скина, название, категория
          (смешные, для девочек, для мальчиков, аниме) и файл развёртки для
          скачивания. У каждого поста отображается ник автора.
        </p>
        <p>Список скинов и форма добавления будут подключены к API.</p>
      </PageSection>
    </div>
  );
}
