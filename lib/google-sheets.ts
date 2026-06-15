import { google } from "googleapis";
import type { AttendanceRecord, Employee } from "@/lib/types";

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!email || !key || !spreadsheetId) {
    return null;
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return { sheets: google.sheets({ version: "v4", auth }), spreadsheetId };
}

function normalizePrivateKey(rawKey?: string) {
  if (!rawKey) return undefined;

  const trimmed = rawKey.trim();
  const unquoted = (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  )
    ? trimmed.slice(1, -1)
    : trimmed;

  try {
    const parsed = JSON.parse(unquoted) as { private_key?: string };
    if (parsed.private_key) {
      return normalizeKeyLineBreaks(parsed.private_key);
    }
  } catch {
    // The env value is usually just the private_key string, not the full JSON file.
  }

  const privateKeyMatch = unquoted.match(/["']?private_key["']?\s*:\s*["']([\s\S]*?)["']\s*,?$/);
  if (privateKeyMatch?.[1]) {
    return normalizeKeyLineBreaks(privateKeyMatch[1]);
  }

  return normalizeKeyLineBreaks(unquoted);
}

function normalizeKeyLineBreaks(value: string) {
  return value
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
}

async function ensureSheet(title: string, headers: string[]) {
  const client = getSheetsClient();
  if (!client) return;
  const meta = await client.sheets.spreadsheets.get({ spreadsheetId: client.spreadsheetId });
  const exists = meta.data.sheets?.some((sheet) => sheet.properties?.title === title);
  if (!exists) {
    await client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] }
    });
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] }
    });
  }
}

export async function syncAttendanceToSheets(record: AttendanceRecord) {
  const client = getSheetsClient();
  if (!client) return;

  try {
    const month = new Date(record.timestamp).toLocaleString("en-US", { month: "long" }).toUpperCase();
    const year = new Date(record.timestamp).getFullYear();
    const monthlySheet = `${year}_${month}`;
    const employeeSheet = `EMP_${record.employee_name.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}`;

    const masterHeaders = ["Timestamp", "Date", "Month", "Employee ID", "Name", "Email", "Attendance Type", "Branch", "Location", "Latitude", "Longitude", "Verification ID", "Original Photo URL", "Verification Photo URL"];
    await ensureSheet("MASTER_ATTENDANCE", masterHeaders);
    await ensureSheet(monthlySheet, masterHeaders);
    await ensureSheet(employeeSheet, ["Date", "Time In", "Time Out", "Hours Worked", "Branch", "Location", "Status"]);
    await ensureSheet("ATTENDANCE_EVIDENCE", ["Timestamp", "Employee ID", "Employee Name", "Attendance Type", "Original Photo URL", "Verification Photo URL", "Location"]);

    const masterRow = [record.timestamp, record.date, month, record.employee_id, record.employee_name, record.email, record.attendance_type, record.branch, record.address, record.latitude, record.longitude, record.verification_id, record.original_photo_url, record.verification_photo_url];
    await append(client, "MASTER_ATTENDANCE", masterRow);
    await append(client, monthlySheet, masterRow);
    await append(client, "ATTENDANCE_EVIDENCE", [record.timestamp, record.employee_id, record.employee_name, record.attendance_type, record.original_photo_url, record.verification_photo_url, record.address]);
  } catch (error) {
    return { warning: error instanceof Error ? error.message : "Google Sheets sync failed." };
  }
}

export async function syncEmployeeToSheets(employee: Employee) {
  const client = getSheetsClient();
  if (!client) return;
  try {
    await ensureSheet("EMPLOYEES", ["Employee ID", "Name", "Email", "Position", "Department", "Branch", "Status"]);
    await ensureSheet(`EMP_${employee.full_name.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}`, ["Date", "Time In", "Time Out", "Hours Worked", "Branch", "Location", "Status"]);
    await append(client, "EMPLOYEES", [employee.employee_id, employee.full_name, employee.email, employee.position, employee.department, employee.branch_name, employee.status]);
  } catch (error) {
    return { warning: error instanceof Error ? error.message : "Google Sheets sync failed." };
  }
}

async function append(client: NonNullable<ReturnType<typeof getSheetsClient>>, sheet: string, row: unknown[]) {
  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: `${sheet}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] }
  });
}
