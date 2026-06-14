import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("min-h-10 w-full rounded-ui border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-hill", className)}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("min-h-10 w-full rounded-ui border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-hill", className)}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("grid gap-1.5 text-sm font-bold text-slate-600", className)} {...props} />;
}
