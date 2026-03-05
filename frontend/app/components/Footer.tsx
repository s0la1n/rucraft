import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link href="/" className="site-logo" aria-label="RuCraft — на главную">
          RuCraft
        </Link>
      </div>
    </footer>
  );
}
