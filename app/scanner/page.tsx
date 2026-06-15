"use client";

import Image from "next/image";
import { AttendanceScanner } from "@/components/attendance-scanner";

export default function ScannerPage() {
  return (
    <main className="min-h-screen bg-[#f6f8ef] p-4 lg:p-8">
      <div className="mx-auto grid max-w-[1500px] gap-5">
        <header className="flex items-center justify-between gap-4 rounded-ui border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Organization logo" width={56} height={56} className="rounded-ui border object-contain" />
            <div>
              <p className="text-xs font-black uppercase text-brand-hill">Daily Time Record</p>
              <h1 className="text-2xl font-black text-brand-dark">Attendance Scanner</h1>
            </div>
          </div>
          <div className="hidden rounded-ui bg-brand-light-yellow px-4 py-2 text-sm font-black text-brand-dark sm:block">
            Live QR / ID
          </div>
        </header>
        <AttendanceScanner />
      </div>
    </main>
  );
}
