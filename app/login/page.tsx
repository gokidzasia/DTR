import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8ef] p-4">
      <div className="w-full max-w-md rounded-ui border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/logo.png" alt="Organization logo" width={56} height={56} className="rounded-ui border object-contain" />
          <div>
            <p className="text-xs font-black uppercase text-brand-hill">Daily Time Record</p>
            <h1 className="text-2xl font-black text-brand-dark">Sign In</h1>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
