"use client";

import { Suspense } from "react";
import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";

export default function DashboardProfilePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900">
      <Suspense fallback={<div className="p-8 text-center">Loading Profile Workspace...</div>}>
        <ProfileWorkspace mode="dashboard" />
      </Suspense>
    </div>
  );
}
