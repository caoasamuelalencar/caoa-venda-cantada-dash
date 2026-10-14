import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { redirectToLogin } from "@/lib/auth-redirect";
import { authOptions } from "@/lib/nextAuth";
import { hasScreenAccess } from "@/lib/server-screen-access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirectToLogin("/admin/access-management");
  if (!await hasScreenAccess("ACCESS_MANAGEMENT")) {
    redirect("/access-denied?error=ScreenAccessDenied");
  }
  return children;
}
