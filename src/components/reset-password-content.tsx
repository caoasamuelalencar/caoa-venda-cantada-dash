"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { consumePasswordResetToken, updatePassword, verifyPasswordResetToken } from "@/lib/auth";

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "invalid" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const username = verifyPasswordResetToken(token);
    setStatus(username ? "ready" : "invalid");
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação da senha não coincide.");
      return;
    }

    const username = verifyPasswordResetToken(token);
    if (!username) {
      setStatus("invalid");
      return;
    }

    const updated = await updatePassword(username, password);
    if (!updated) {
      setError("Não foi possível atualizar a senha.");
      return;
    }

    consumePasswordResetToken(token);
    router.push("/login");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {status === "loading" && <p>Validando token...</p>}
        {status === "invalid" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Link inválido</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">O link de redefinição expirou ou é inválido. Solicite um novo link.</p>
            <Link href="/forgot-password" className="inline-flex rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
              Solicitar novo link
            </Link>
          </div>
        )}

        {status === "ready" && (
          <>
            <div className="mb-8 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Redefinir senha</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Criar nova senha</h1>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nova senha</span>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar senha</span>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repita a senha"
                  required
                />
              </label>

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/40 dark:text-red-200">{error}</div>}

              <button type="submit" className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                Redefinir senha
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Voltar ao login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
