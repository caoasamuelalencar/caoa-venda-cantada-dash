import { redirect } from "next/navigation";
import { hasScreenAccess } from "@/lib/server-screen-access";

export default async function BrandReportLayout({ children }: { children: React.ReactNode }) {
  if (!await hasScreenAccess("REPORT_BRAND")) {
    redirect("/access-denied?error=ScreenAccessDenied");
  }
  return children;
}
