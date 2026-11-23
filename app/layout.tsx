import type { Metadata, Viewport } from "next";
import { Jua, Nunito, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  variable: "--ff-unbounded",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

const sans = Nunito({
  variable: "--ff-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

// Hangul stickers only. Jua has NO Polish diacritics – never use it for Polish text.
const hangul = Jua({
  variable: "--ff-jua",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Szybki quiz",
  description: "Krótki, anonimowy quiz — wpisz nick, odpowiedz na pytania i gotowe.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${display.variable} ${sans.variable} ${hangul.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
