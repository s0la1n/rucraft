import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Сиды — RuCraft",
  description: "Сиды для Minecraft: название, номер сида, версия, релиз, координаты.",
};

export default function SeedsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageSection title="Сиды">
        <p className="text-zinc-600 dark:text-zinc-400">
          Пользователи добавляют сиды: название, номер сида (19 цифр со знаком +
          или -), версия (Java / Bedrock / оба), релиз (1.0, 1.1, 1.2.1, 1.2.2,
          1.2.3, 1.2.4 и т.д.) и координаты найденного места (x, z, y со знаком
          + или -). У каждого поста — ник автора.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          Список сидов и форма добавления будут подключены к API.
        </p>
      </PageSection>
    </main>
  );
}
