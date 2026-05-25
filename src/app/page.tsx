import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const authCookie = (await cookies()).get("caoa-auth")?.value;
  redirect(authCookie ? "/relatorios" : "/login");
}
