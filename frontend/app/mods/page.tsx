import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Моды — RuCraft",
  description: "Моды для Minecraft: название, фото, описание, zip или rar файл.",
};

export default function ModsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageSection title="Моды">
        <p className="text-zinc-600 dark:text-zinc-400">
          Пользователи выкладывают моды: название, несколько фото, описание и
          zip или rar файл. У каждого поста отображается ник автора.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          Список модов и форма добавления будут подключены к API.
        </p>
      </PageSection>
    </main>
  );
}
