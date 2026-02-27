import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Скины — RuCraft",
  description: "Скины для Minecraft: смешные, для девочек, для мальчиков, аниме. Фото и развёртка для скачивания.",
};

export default function SkinsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageSection title="Скины">
        <p className="text-zinc-600 dark:text-zinc-400">
          Здесь пользователи выкладывают скины: фото скина, название, категория
          (смешные, для девочек, для мальчиков, аниме) и файл развёртки для
          скачивания. У каждого поста отображается ник автора.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          Список скинов и форма добавления будут подключены к API.
        </p>
      </PageSection>
    </main>
  );
}
