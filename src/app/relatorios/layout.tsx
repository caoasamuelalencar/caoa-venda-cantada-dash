import Container from "@/components/container";
import { TopNav } from "@/components/nav";

export default function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav title="Relatórios" />
      <main>
        <Container>{children}</Container>
      </main>
    </>
  );
}
