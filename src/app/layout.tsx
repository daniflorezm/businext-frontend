"use client";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { usePathname } from "next/navigation";
import { routesWithoutHeader } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const notContainHeader = routesWithoutHeader.includes(pathname);

  return (
    <html lang="en">
      <body>
        {!notContainHeader && <Header />}
        {children}
      </body>
    </html>
  );
}
