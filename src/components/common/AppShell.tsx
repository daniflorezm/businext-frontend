"use client";

import { usePathname } from "next/navigation";
import { useAccessContext } from "@/hooks/useAccessContext";
import { Sidebar } from "@/components/common/Sidebar";
import { routesWithoutHeader } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { context } = useAccessContext();

  const isPublicRoute = routesWithoutHeader.includes(pathname);
  // Employees only access reservations — no sidebar needed
  const showSidebar =
    !isPublicRoute &&
    context !== null;

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main
        className={`flex-1 min-w-0 ${
          showSidebar ? "md:ml-64" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
