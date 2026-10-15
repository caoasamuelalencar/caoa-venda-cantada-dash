import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { redirectToLogin } from "@/lib/auth-redirect";
import { authOptions } from "@/lib/nextAuth";
import { hasScreenAccess } from "@/lib/server-screen-access";

export default async function SalesIntentionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Usuário não autenticado - redireciona para login
  if (!session?.user) {
    redirectToLogin("/sales-intention");
  }
  if (!await hasScreenAccess("SALES_INTENTION")) {
    redirect("/access-denied?error=ScreenAccessDenied");
  }

  return <>{children}</>;
}
