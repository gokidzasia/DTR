"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase-browser";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function login(formData: FormData) {
    if (!hasSupabaseBrowserConfig()) {
      setMessage("Add your Supabase URL and anon key in .env.local, then restart the app.");
      return;
    }

    setMessage("Signing in...");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form action={login} className="grid gap-4">
      <Label>Email<Input name="email" type="email" required /></Label>
      <Label>Password<Input name="password" type="password" required /></Label>
      <Button type="submit">Sign In</Button>
      <p className="text-sm text-slate-500">{message}</p>
    </form>
  );
}
