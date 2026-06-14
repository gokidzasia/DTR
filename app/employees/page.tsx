import { AppShell } from "@/components/app-shell";
import { EmployeeManager } from "@/components/employee-manager";

export default function EmployeesPage() {
  return (
    <AppShell active="Employees">
      <EmployeeManager />
    </AppShell>
  );
}
