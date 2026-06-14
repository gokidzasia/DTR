"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";

interface EmployeeRow {
  employee_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  profile_photo_url: string | null;
  status: string;
  role: string;
}

export function EmployeeManager() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [status, setStatus] = useState("Loading employees...");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const response = await fetch("/api/employees");
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Could not load employees.");
      return;
    }
    setEmployees(payload);
    setStatus(`${payload.length} employees loaded.`);
  }

  async function saveEmployee(formData: FormData) {
    setStatus("Saving employee...");
    const response = await fetch("/api/employees", {
      method: "POST",
      body: formData
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Employee save failed.");
      return;
    }
    setStatus(`${payload.full_name} saved.`);
    await loadEmployees();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
          <UserPlus className="text-brand-hill" />
        </CardHeader>
        <form action={saveEmployee} className="grid gap-3">
          <Label>Employee ID<Input name="employee_id" required placeholder="EMP-001" /></Label>
          <Label>Full Name<Input name="full_name" required placeholder="John Doe" /></Label>
          <Label>Email<Input name="email" type="email" placeholder="john@example.com" /></Label>
          <Label>Phone<Input name="phone" placeholder="+63..." /></Label>
          <Label>Position<Input name="position" placeholder="Teacher" /></Label>
          <Label>Department<Input name="department" placeholder="Operations" /></Label>
          <Label>Role<Select name="role"><option value="employee">Employee</option><option value="admin">Administrator</option><option value="viewer">Viewer</option></Select></Label>
          <Label>Status<Select name="status"><option value="active">Active</option><option value="inactive">Inactive</option></Select></Label>
          <Label>Profile Photo<Input name="photo" type="file" accept="image/*" /></Label>
          <Button type="submit">Save Staff</Button>
        </form>
        <p className="mt-3 text-sm text-slate-500">{status}</p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.employee_id} className="grid gap-3">
            {employee.profile_photo_url ? <img src={employee.profile_photo_url} alt="" className="h-44 w-full rounded-ui object-cover" /> : null}
            <div>
              <strong className="block text-lg text-brand-dark">{employee.full_name}</strong>
              <span className="text-sm font-bold text-slate-500">{employee.employee_id}</span>
            </div>
            <span>{employee.email}</span>
            <span className="text-sm text-slate-500">{employee.position} {employee.department ? `- ${employee.department}` : ""}</span>
            <span className="w-max rounded-full bg-brand-lime px-3 py-1 text-xs font-black uppercase">{employee.status}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
