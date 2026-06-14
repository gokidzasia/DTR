export type Role = "admin" | "employee" | "viewer";
export type AttendanceType = "TIME IN" | "TIME OUT";
export type EmployeeStatus = "active" | "inactive";

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  branch_id: string | null;
  branch_name?: string | null;
  profile_photo_url: string | null;
  status: EmployeeStatus;
  role: Role;
}

export interface AttendanceRecord {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  employee_id: string;
  employee_name: string;
  email: string | null;
  attendance_type: AttendanceType;
  branch: string;
  latitude: number;
  longitude: number;
  address: string;
  device: string;
  profile_photo_url: string | null;
  original_photo_url: string;
  verification_photo_url: string;
  verification_id: string;
}
