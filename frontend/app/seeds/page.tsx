import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Сиды — RuCraft",
  description: "Сиды для Minecraft: название, номер сида, версия, релиз, координаты.",
};

export default function SeedsPage() {
  return (
    <div className="page-content">
      <PageSection title="Сиды">
        <p>
          Пользователи добавляют сиды: название, номер сида (19 цифр со знаком +
          или -), версия (Java / Bedrock / оба), релиз (1.0, 1.1, 1.2.1, 1.2.2,
          1.2.3, 1.2.4 и т.д.) и координаты найденного места (x, z, y со знаком
          + или -). У каждого поста — ник автора.
        </p>
        <p>Список сидов и форма добавления будут подключены к API.</p>
      </PageSection>
    </div>
  );
}
