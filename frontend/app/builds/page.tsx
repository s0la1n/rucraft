import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Постройки — RuCraft",
  description: "Постройки для Minecraft: название, фото, список блоков и количество, видео.",
};

export default function BuildsPage() {
  return (
    <div className="page-content">
      <PageSection title="Постройки">
        <p>
          Пользователи публикуют постройки: название, фото, список нужных блоков
          и их количество, возможность прикрепить видео. У каждого поста — ник
          автора.
        </p>
        <p>Список построек и форма добавления будут подключены к API.</p>
      </PageSection>
    </div>
  );
}
