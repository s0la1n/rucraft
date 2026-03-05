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
    <section className={`section-page ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
