import { NextResponse } from "next/server";
import { syncAttendanceToSheets, syncEmployeeToSheets } from "@/lib/google-sheets";
import type { AttendanceRecord, Employee } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (payload.kind === "employee") {
      await syncEmployeeToSheets(payload.employee as Employee);
    } else {
      await syncAttendanceToSheets(payload.record as AttendanceRecord);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Google Sheets sync failed." }, { status: 500 });
  }
}
