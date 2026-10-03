"use client";

import { ReactNode } from "react";
import { CopilotProvider } from "@/components/dashboard/CopilotProvider";
import { DrawerProvider } from "@/components/dashboard/DrawerProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth mode="completed" loadingMessage="Checking your workspace...">
      <CopilotProvider>
        <DrawerProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
        </DrawerProvider>
      </CopilotProvider>
    </RequireAuth>
  );
}
