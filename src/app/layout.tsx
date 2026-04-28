import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BABEBAR | Твоя красота — наши правила",
  description: "Дерзкий салон красоты с характером. Маникюр, укладки, макияж и брови в атмосфере брутального люкса.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${syne.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-pink-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
