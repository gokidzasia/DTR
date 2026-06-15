import dynamic from "next/dynamic";

const ScannerPageClient = dynamic(
  () => import("@/components/scanner-page-client").then((module) => module.ScannerPageClient),
  { ssr: false }
);

export default function ScannerPage() {
  return <ScannerPageClient />;
}
