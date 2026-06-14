import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DTR Attendance System",
  description: "Cloud-based Daily Time Record attendance management system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/app-fallback.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
