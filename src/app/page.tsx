import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";
import LoginPage from "./login/page";

export default async function HomePage() {
  const authCookie = (await cookies()).get("caoa-auth")?.value;
  if (authCookie) {
    redirect("/relatorios");
  }

  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/relatorios");
  }

  return <LoginPage />;
}
