import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Постройки — RuCraft",
  description: "Постройки для Minecraft: название, фото, список блоков и количество, видео.",
};

export default function BuildsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageSection title="Постройки">
        <p className="text-zinc-600 dark:text-zinc-400">
          Пользователи публикуют постройки: название, фото, список нужных блоков
          и их количество, возможность прикрепить видео. У каждого поста — ник
          автора.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          Список построек и форма добавления будут подключены к API.
        </p>
      </PageSection>
    </main>
  );
}
