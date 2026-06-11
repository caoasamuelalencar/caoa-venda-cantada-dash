"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { validateCredentials } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"local" | "test" | null>(null);

  async function handleLocalLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const user = await validateCredentials(username, password);

    if (!user) {
      setError("Credenciais inválidas. Verifique usuário e senha.");
      setIsLoading(false);
      return;
    }

    document.cookie = `caoa-auth=${encodeURIComponent(user.username)}; path=/; max-age=${60 * 60 * 24}; sameSite=strict`;
    router.push(searchParams.get("redirect") || "/relatorios");
    setIsLoading(false);
  }

  async function handleTestLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      email: "test@caoa.com.br",
      password: "test",
      redirect: false,
    });

    if (result?.error) {
      setError("Falha ao fazer login com credenciais de teste.");
    } else {
      router.push(searchParams.get("redirect") || "/relatorios");
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Acesso ao sistema</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Entre com sua conta</h1>
        </div>

        {/* Microsoft Sign-in */}
        <button
          onClick={() => signIn("azure-ad")}
          className="mb-6 w-full rounded-2xl border border-blue-400 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
        >
          🔐 Entrar com Microsoft
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">OU</span>
          </div>
        </div>

        {/* Authentication Method Selection */}
        {!authMethod ? (
          <div className="space-y-3">
            <button
              onClick={() => setAuthMethod("local")}
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Acesso Local
            </button>
            <button
              onClick={() => setAuthMethod("test")}
              className="w-full rounded-2xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
            >
              Teste (Dev Only)
            </button>
          </div>
        ) : null}

        {/* Local Login Form */}
        {authMethod === "local" && (
          <>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Use o usuário padrão <strong>CAOA</strong> e senha <strong>CAOA</strong> ou cadastre um novo usuário.
            </p>
            <form className="space-y-6" onSubmit={handleLocalLogin}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome de usuário</span>
                <input
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="CAOA"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha</span>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? "Aguarde..." : "Entrar"}
              </button>
            </form>

            <button
              onClick={() => setAuthMethod(null)}
              className="mt-4 w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Voltar
            </button>
          </>
        )}

        {/* Test Login Form (Development Only) */}
        {authMethod === "test" && (
          <>
            <form className="space-y-6" onSubmit={handleTestLogin}>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/40 dark:text-amber-200">
                <strong>Modo Teste (Desenvolvimento)</strong>
                <p className="mt-1">Email: test@caoa.com.br</p>
                <p>Senha: test</p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? "Aguarde..." : "Entrar com Teste"}
              </button>
            </form>

            <button
              onClick={() => setAuthMethod(null)}
              className="mt-4 w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Voltar
            </button>
          </>
        )}

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
