import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Разработчики — RuCraft",
  description: "Информация о команде разработки RuCraft.",
};

export default function DevelopersPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageSection title="Разработчики">
        <p className="text-zinc-600 dark:text-zinc-400">
          Страница с информацией о разработчиках сайта: роли, скины, био,
          ссылки на Telegram и VK.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          Карточки разработчиков будут подгружаться из API.
        </p>
      </PageSection>
    </main>
  );
}
