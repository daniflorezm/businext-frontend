"use client";
import { Header } from "@/components/common/Header";
import { usePathname } from "next/navigation";
import { routesWithoutHeader } from "@/lib/utils";
import { useEffect, useState } from "react";

export function HeaderWrapper() {
  const pathname = usePathname();
  const [shouldShowHeader, setShouldShowHeader] = useState(false);

  useEffect(() => {
    const notContainHeader = routesWithoutHeader.includes(pathname);
    setShouldShowHeader(!notContainHeader);
  }, [pathname]);

  if (!shouldShowHeader) return null;

  return <Header />;
}
