import Link from "next/link";

export const metadata = {
  title: "Создать скин — RuCraft",
  description: "Нарисуйте скин и посмотрите, как он будет выглядеть на модели.",
};

export default function CreateSkinPage() {
  return (
    <div className="page-content">
      <div className="skins-list-page" style={{ paddingTop: "24px" }}>
        <h1>Создать скин</h1>
        <p>
          На этой странице вы сможете нарисовать скин и посмотреть, как он будет выглядеть на модели. Функция в разработке.
        </p>
        <p>
          <Link href="/skins" className="skins-action-btn" style={{ display: "inline-flex" }}>
            ← Назад к скинам
          </Link>
        </p>
      </div>
    </div>
  );
}
