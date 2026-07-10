import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";
import { redirect } from "next/navigation";
import Container from "@/components/container";
import { TopNav } from "@/components/nav";

export default async function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Usuário não autenticado - redireciona para login
  if (!session?.user) {
    redirect("/login?error=AccessDenied");
  }

  return (
    <>
      <TopNav title="Relatórios" className="max-w-none mx-0 px-4 sm:px-6 lg:px-8" />
      <main className="w-full pb-8">
        <Container className="max-w-none mx-0 px-4 sm:px-6 lg:px-8">
          {children}
        </Container>
      </main>
    </>
  );
}
