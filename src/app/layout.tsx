import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Recettes Famille",
  description:
    "Le carnet de recettes partagé de la famille : chacun ajoute ses plats préférés, tout le monde se régale. Simple, sans compte, fait avec amour.",
  applicationName: "Recettes Famille",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Recettes Famille",
    description:
      "Le carnet de recettes partagé de la famille. Ajoutez vos plats préférés et régalez tout le monde !",
    siteName: "Recettes Famille",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#D9542B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
