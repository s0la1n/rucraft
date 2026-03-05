import { PageSection } from "../components/PageSection";

export const metadata = {
  title: "Моды — RuCraft",
  description: "Моды для Minecraft: название, фото, описание, zip или rar файл.",
};

export default function ModsPage() {
  return (
    <div className="page-content">
      <PageSection title="Моды">
        <p>
          Пользователи выкладывают моды: название, несколько фото, описание и
          zip или rar файл. У каждого поста отображается ник автора.
        </p>
        <p>Список модов и форма добавления будут подключены к API.</p>
      </PageSection>
    </div>
  );
}
