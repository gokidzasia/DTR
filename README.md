# Cloud-Based DTR Attendance Management System

Production-ready starter for a cloud DTR Attendance Management System using Next.js 15, TypeScript, Tailwind, Supabase, Supabase Storage, Supabase Realtime, Google Sheets, Resend, GPS, and Vercel.

The previous static prototype files are still present, but the production app now lives in the Next.js `app/`, `components/`, `lib/`, and `supabase/` folders.

## Main Features

- QR code and manual Employee ID attendance
- Automatic TIME IN / TIME OUT detection
- Camera evidence capture required
- GPS capture required
- Original photo and stamped verification photo stored in Supabase Storage
- Verification overlay with employee, timestamp, GPS, address, branch, and verification ID
- Supabase PostgreSQL as source of truth
- Google Sheets sync for reporting
- Resend attendance confirmation emails
- Realtime dashboard using Supabase Realtime
- Employee management with profile photos
- Reports with CSV export
- Role-ready schema for admin, employee, and viewer

## One By One Setup

1. Install dependencies:

```powershell
npm install
```

2. Create `.env.local` from `.env.example`.

3. Create a Supabase project.

4. Run this SQL in Supabase:

```text
supabase/migrations/001_initial_schema.sql
```

5. Create or confirm the Supabase Storage bucket:

```text
attendance-evidence
```

6. Add your Supabase values to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=attendance-evidence
```

7. Create a Google Cloud service account and share your Google Sheet with that service account email.

8. Add Google Sheets values to `.env.local`:

```text
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

9. Create a Resend API key and add:

```text
RESEND_API_KEY=
RESEND_FROM_EMAIL="DTR <noreply@example.com>"
```

10. Start the app:

```powershell
npm run dev
```

11. Open:

```text
http://localhost:3000
```

12. Sign in using Supabase Auth.

13. Go to Employees and add staff with profile photos.

14. Generate employee QR codes using the employee ID.

15. Scan attendance from the Scanner page.

16. View live records in Dashboard and Reports.

## Pages

- `/login` - Supabase Auth login
- `/` - Attendance scanner
- `/dashboard` - Realtime admin dashboard
- `/employees` - Employee management
- `/reports` - Reports and CSV export
- `/settings` - Environment/setup summary

## Google Sheets Created Automatically

The app creates/syncs:

- `MASTER_ATTENDANCE`
- `EMPLOYEES`
- `ATTENDANCE_EVIDENCE`
- monthly sheets like `2026_JUNE`
- employee sheets like `EMP_JOHN_JACOB_TAMON`

## Required Attendance Evidence

Attendance is rejected unless:

- employee exists and is active
- camera permission is granted
- evidence photo is captured
- GPS is available
- original photo uploads to Supabase
- verification photo uploads to Supabase
- record saves to Supabase

## Deployment to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add all `.env.local` values as Vercel Environment Variables.
4. Deploy.

Supabase remains the source of truth. Google Sheets is the reporting and monitoring layer.
