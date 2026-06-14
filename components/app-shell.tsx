import Image from "next/image";
import Link from "next/link";
import { BarChart3, CalendarDays, FileSpreadsheet, QrCode, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/scanner", label: "Scanner", icon: QrCode },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/reports", label: "Reports", icon: FileSpreadsheet },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="min-h-screen bg-[#f6f8ef]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/logo.png" alt="Organization logo" width={52} height={52} className="rounded-ui border object-contain" />
          <div>
            <p className="text-xs font-bold uppercase text-brand-hill">Daily Time Record</p>
            <h1 className="text-xl font-black text-brand-dark">DTR System</h1>
          </div>
        </div>
        <nav className="grid gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-ui px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-brand-yellow/50",
                  active === item.label && "bg-brand-hill text-white hover:bg-brand-hill"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Organization logo" width={42} height={42} className="rounded-ui border object-contain" />
            <strong>DTR System</strong>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-ui border px-3 py-2 text-xs font-bold">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
