"use client";

import { AppShell } from "@/components/app-shell";
import { AttendanceScanner } from "@/components/attendance-scanner";

export default function ScannerPage() {
  return (
    <AppShell active="Scanner">
      <AttendanceScanner />
    </AppShell>
  );
}
