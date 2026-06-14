import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <AppShell active="Settings">
      <div className="grid gap-5">
        <div>
          <p className="text-xs font-black uppercase text-brand-hill">Configuration</p>
          <h1 className="text-3xl font-black text-brand-dark">System Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <div className="grid gap-2 text-sm text-slate-600">
            <p>Configure Supabase, Google Sheets, and Resend in `.env.local` before deployment.</p>
            <code className="rounded-ui bg-slate-100 p-3">NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID, RESEND_API_KEY</code>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
