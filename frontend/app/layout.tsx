import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Comic_Relief} from 'next/font/google'
import { AuthProvider } from "./context/AuthContext";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import "./globals.css";

const comicRelief = Comic_Relief({
  weight: ["400", "700"],
  variable: "--font-comic-relief",
  subsets: ["latin", "cyrillic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
}); 

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "RuCraft — скины, постройки, моды, сиды для Minecraft",
  description: "Скины, постройки, моды и сиды для Minecraft. Публикуйте и скачивайте контент.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} site-root`}>
        <AuthProvider>
          <div className="content-area">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
