import "./globals.css";
import { HeaderWrapper } from "@/components/common/HeaderWrapper";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Businext",
    template: "%s | Businext", // Para páginas específicas
  },
  description:
    "Gestiona tus reservas y finanzas fácilmente con Businext. Optimiza tu negocio y mejora la experiencia de tus clientes.",
  keywords: [
    "reservas",
    "finanzas",
    "gestión",
    "negocio",
    "clientes",
    "BookerApp",
    "Businext",
    "aplicación de reservas",
  ],
  authors: [{ name: "Daniel Flórez" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://businext.greenfourtech.com",
    siteName: "Businext",
    title: "Businext",
    description: "Gestiona tus reservas y finanzas fácilmente con Businext.",
    images: [
      {
        url: "https://businext.greenfourtech.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Businext App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Businext",
    description: "Gestiona tus reservas y finanzas fácilmente con Businext.",
    images: ["https://businext.greenfourtech.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="-6Ifr3rBdu0PZbkiYVIKT03g9hN9bdKczlTyVcaXCVM"
        />
      </head>
      <body>
        <HeaderWrapper />
        {children}
      </body>
    </html>
  );
}
