import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-ui px-4 text-sm font-bold transition",
        variant === "primary" && "bg-brand-hill text-white hover:brightness-95",
        variant === "outline" && "border border-slate-200 bg-white text-brand-dark hover:bg-brand-yellow/40",
        variant === "ghost" && "bg-transparent text-brand-dark hover:bg-brand-yellow/40",
        className
      )}
      {...props}
    />
  );
}
