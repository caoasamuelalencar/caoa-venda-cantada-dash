"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { validateCredentials } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    router.push("/relatorios");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Acesso ao sistema</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Entre com sua conta</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Use o usuário padrão <strong>CAOA</strong> e senha <strong>CAOA</strong> ou cadastre um novo usuário.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
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

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/40 dark:text-red-200">{error}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "Aguarde..." : "Entrar"}
          </button>
        </form>

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
