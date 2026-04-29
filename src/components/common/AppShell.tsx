"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSWRConfig } from "swr";
import { useAccessContext, ACCESS_CONTEXT_SWR_KEY } from "@/hooks/useAccessContext";
import { Sidebar } from "@/components/common/Sidebar";
import { ToastProvider } from "@/context/ToastContext";
import { routesWithoutHeader } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { context, loading } = useAccessContext();
  const { mutate } = useSWRConfig();
  const prevPathname = useRef(pathname);

  // Force SWR refetch when navigating away from login/signup (auth state changed)
  useEffect(() => {
    const wasAuthRoute =
      prevPathname.current === "/login" || prevPathname.current === "/signup";
    const isNowProtected = !routesWithoutHeader.includes(pathname);

    if (wasAuthRoute && isNowProtected) {
      mutate(ACCESS_CONTEXT_SWR_KEY);
    }
    prevPathname.current = pathname;
  }, [pathname, mutate]);

  const isPublicRoute = routesWithoutHeader.includes(pathname);
  const showSidebar = !isPublicRoute && (context !== null || loading);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        {showSidebar && <Sidebar />}
        <main
          className={`flex-1 min-w-0 ${showSidebar ? "md:ml-64" : ""}`}
        >
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
