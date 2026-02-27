import Link from "next/link";
import { BackendStatus } from "./components/BackendStatus";

const sections = [
  {
    href: "/skins",
    title: "Скины",
    desc: "Выкладывайте скины: фото, название, категория и файл развёртки для скачивания.",
  },
  {
    href: "/builds",
    title: "Постройки",
    desc: "Делитесь постройками: название, фото, список блоков и количество, видео.",
  },
  {
    href: "/mods",
    title: "Моды",
    desc: "Публикуйте моды: название, несколько фото, описание и zip/rar файл.",
  },
  {
    href: "/seeds",
    title: "Сиды",
    desc: "Добавляйте сиды: название, номер сида, версия, релиз и координаты места.",
  },
  {
    href: "/developers",
    title: "Разработчики",
    desc: "Информация о команде разработки сайта.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Слайдер */}
      <section className="relative h-64 overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-900 md:h-80">
        <div className="flex h-full items-center justify-center px-4">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold md:text-4xl">RuCraft</h1>
            <p className="mt-2 text-emerald-100">
              Скины, постройки, моды и сиды для Minecraft
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <BackendStatus />

        {/* Блоки о каждой странице */}
        <section className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {sections.map(({ href, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{desc}</p>
              <span className="mt-3 inline-block text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Перейти →
              </span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
