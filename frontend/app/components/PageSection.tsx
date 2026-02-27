import type { ReactNode } from "react";

export function PageSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-8 md:py-12 ${className}`}>
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      {children}
    </section>
  );
}
