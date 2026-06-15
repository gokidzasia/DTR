"use client";

import { AppShell } from "@/components/app-shell";
import { AttendanceScanner } from "@/components/attendance-scanner";

export function ScannerPageClient() {
  return (
    <AppShell active="Scanner">
      <AttendanceScanner />
    </AppShell>
  );
}
