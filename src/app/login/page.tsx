"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Acesso ao sistema</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Entre com sua conta</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Microsoft Sign-in */}
        <button
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
          className="w-full rounded-2xl border border-blue-400 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-600 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
        >
          {isLoading ? "Conectando..." : "🔐 Entrar com Microsoft"}
        </button>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Esqueci minha senha
          </Link>
          <Link href="/register" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}

