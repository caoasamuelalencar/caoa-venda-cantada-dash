"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/relatorios");
    }
  }, [router, status]);

  if (status === "authenticated") {
    return null;
  }

  async function handleMicrosoftSignIn() {
    setError(null);
    setIsLoading(true);
    try {
      await signIn("azure-ad", { redirect: true });
    } catch (err) {
      setError("Erro ao conectar com Microsoft. Tente novamente.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8">
          <div className="mb-6">
            <BrandLogo className="mx-auto w-full max-w-[320px]" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Acesso ao painel de vendas e relatórios.
          </p>
        </div>


        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className="flex-1 rounded-2xl bg-[#0078d4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0066c0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Conectando..." : "Entrar com Microsoft"}
          </button>
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
