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
