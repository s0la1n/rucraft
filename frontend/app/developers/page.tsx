import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Разработчики — RuCraft",
  description: "Информация о команде разработки RuCraft.",
};

export default function DevelopersPage() {
  return (
    <div className="page-content">
      <PageSection title="Разработчики">
        <p>
          Страница с информацией о разработчиках сайта: роли, скины, био,
          ссылки на Telegram и VK.
        </p>
        <p>Карточки разработчиков будут подгружаться из API.</p>
      </PageSection>
    </div>
  );
}
