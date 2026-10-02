import { ReactNode } from "react";
import { CopilotProvider } from "@/components/dashboard/CopilotProvider";
import { DrawerProvider } from "@/components/dashboard/DrawerProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CopilotProvider>
      <DrawerProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </DrawerProvider>
    </CopilotProvider>
  );
}
