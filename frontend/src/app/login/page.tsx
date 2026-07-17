"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

const MIN_LOADING_MS = 1000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackUsername, setFallbackUsername] = useState("admin");
  const [fallbackPassword, setFallbackPassword] = useState("admin");
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);
  const allowFallbackAuth = process.env.NEXT_PUBLIC_FALLBACK_AUTH === "true";

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/relatorios");
    }
  }, [router, status]);

  if (status === "authenticated") {
    return null;
  }

  async function handleMicrosoftSignIn() {
    setIsLoading(true);
    const startedAt = Date.now();
    try {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await wait(MIN_LOADING_MS - elapsed);
      }
      await signIn("azure-ad", { redirect: true });
    } catch {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await wait(MIN_LOADING_MS - elapsed);
      }
      setIsLoading(false);
    }
  }

  async function handleFallbackSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFallbackError(null);
    setIsFallbackLoading(true);
    const startedAt = Date.now();

    const result = await signIn("credentials", {
      redirect: false,
      username: fallbackUsername,
      password: fallbackPassword,
      callbackUrl: "/relatorios",
    });

    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_LOADING_MS) {
      await wait(MIN_LOADING_MS - elapsed);
    }

    setIsFallbackLoading(false);

    if (result?.error || !result?.ok) {
      setFallbackError("Credenciais inválidas ou autenticação alternativa indisponível.");
      return;
    }

    router.push(result.url ?? "/relatorios");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-8">
          <div className="mb-6">
            <BrandLogo className="mx-auto w-full max-w-[320px]" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Acesso ao painel de vendas e relatórios.
          </p>
        </div>


        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Conectando..." : "Entrar com Microsoft"}
          </Button>
        </div>

        {allowFallbackAuth ? (
          <form className="mt-8 space-y-4" onSubmit={handleFallbackSignIn}>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/80">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Acesso temporário</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use credenciais de homologação quando o login Microsoft não estiver disponível.
              </p>

              <label className="mt-4 block text-sm text-slate-700 dark:text-slate-300">
                Usuário
                <input
                  className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-slate-950"
                  value={fallbackUsername}
                  onChange={(event) => setFallbackUsername(event.target.value)}
                  placeholder="admin"
                  required
                />
              </label>

              <label className="mt-4 block text-sm text-slate-700 dark:text-slate-300">
                Senha
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-slate-950"
                  value={fallbackPassword}
                  onChange={(event) => setFallbackPassword(event.target.value)}
                  placeholder="admin"
                  required
                />
              </label>

              {fallbackError && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100">
                  {fallbackError}
                </div>
              )}

              <Button type="submit" className="mt-5 w-full" disabled={isFallbackLoading}>
                {isFallbackLoading ? "Verificando..." : "Entrar com credenciais temporárias"}
              </Button>
            </div>
          </form>
        ) : null}

{/*         <div className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p>
            Não tem uma conta?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Crie uma!
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Não consegue acessar sua conta?
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
