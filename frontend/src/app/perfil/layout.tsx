import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { redirectToLogin } from "@/lib/auth-redirect";
import { authOptions } from "@/lib/nextAuth";
import { hasScreenAccess } from "@/lib/server-screen-access";

export default async function PerfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirectToLogin("/perfil");
  }
  if (!await hasScreenAccess("PROFILE")) {
    redirect("/access-denied?error=ScreenAccessDenied");
  }

  return <>{children}</>;
}
