import { NextResponse } from "next/server";
import { sendAttendanceEmail } from "@/lib/email";
import type { AttendanceRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const record = (await request.json()) as AttendanceRecord;
    await sendAttendanceEmail(record);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Email failed." }, { status: 500 });
  }
}
