"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, Clock, LogIn, LogOut, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase-browser";
import type { AttendanceRecord } from "@/lib/types";

export function DashboardClient() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const hasBackend = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (hasBackend ? createSupabaseBrowserClient() : null), [hasBackend]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    loadRecords();
    const channel = supabase
      .channel("attendance-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, () => loadRecords())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function loadRecords() {
    if (!supabase) {
      return;
    }

    const { data } = await supabase
      .from("attendance_records")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(200);
    setRecords((data || []) as AttendanceRecord[]);
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayRows = records.filter((record) => record.timestamp.startsWith(today));
  const timeIns = todayRows.filter((record) => record.attendance_type === "TIME IN");
  const timeOuts = todayRows.filter((record) => record.attendance_type === "TIME OUT");
  const branchCount = new Set(records.map((record) => record.branch)).size;

  if (!hasBackend) {
    return (
      <AppShell active="Dashboard">
        <Card>
          <CardHeader>
            <CardTitle>Supabase setup required</CardTitle>
          </CardHeader>
          <p className="text-slate-600">
            Add your Supabase URL and anon key in .env.local, then restart the app. The scanner page can still open while setup is not finished.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell active="Dashboard">
      <div className="grid gap-5">
        <div>
          <p className="text-xs font-black uppercase text-brand-hill">Realtime</p>
          <h1 className="text-3xl font-black text-brand-dark">Attendance Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric title="Present Today" value={timeIns.length} icon={Users} />
          <Metric title="Time In" value={timeIns.length} icon={LogIn} />
          <Metric title="Time Out" value={timeOuts.length} icon={LogOut} />
          <Metric title="Active Branches" value={branchCount} icon={Building2} />
          <Metric title="Events" value={todayRows.length} icon={Activity} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Latest Attendance</CardTitle>
            <Clock className="text-brand-hill" />
          </CardHeader>
          <div className="grid gap-3">
            {records.map((record) => (
              <article key={record.id} className="grid gap-3 rounded-ui border border-slate-200 p-3 md:grid-cols-[72px_1fr_auto]">
                {record.profile_photo_url ? <img src={record.profile_photo_url} alt="" className="h-16 w-16 rounded-ui object-cover" /> : <div className="h-16 w-16 rounded-ui bg-brand-yellow" />}
                <div>
                  <strong className="block text-brand-dark">{record.employee_name}</strong>
                  <span className="text-sm font-bold text-slate-500">{record.employee_id}</span>
                  <p className="text-sm text-slate-600">{record.branch} - {record.address}</p>
                  <p className="text-xs text-slate-500">{record.verification_id}</p>
                </div>
                <div className="grid justify-items-start gap-2 md:justify-items-end">
                  <span className="rounded-full bg-brand-lime px-3 py-1 text-xs font-black">{record.attendance_type}</span>
                  <span className="text-sm text-slate-500">{record.date} {record.time}</span>
                  <a className="text-sm font-bold text-brand-hill" href={record.verification_photo_url} target="_blank">Evidence</a>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Users }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-slate-500">{title}</span>
          <strong className="block text-3xl font-black text-brand-hill">{value}</strong>
        </div>
        <Icon className="text-brand-orange" />
      </div>
    </Card>
  );
}
