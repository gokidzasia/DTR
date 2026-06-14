import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeviceInfo() {
  if (typeof navigator === "undefined") return "Server";
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || "Unknown platform";
  return `${platform} | ${navigator.userAgent}`;
}

export function generateVerificationId(date = new Date(), sequence = 1) {
  const compact = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `ATT-${compact}-${String(sequence).padStart(4, "0")}`;
}
