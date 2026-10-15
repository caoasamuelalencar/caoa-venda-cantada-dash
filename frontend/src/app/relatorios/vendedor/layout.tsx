import { redirect } from "next/navigation";
import { hasScreenAccess } from "@/lib/server-screen-access";

export default async function SellerReportLayout({ children }: { children: React.ReactNode }) {
  if (!await hasScreenAccess("REPORT_SELLER")) {
    redirect("/access-denied?error=ScreenAccessDenied");
  }
  return children;
}
