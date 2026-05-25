"use client";

import Link from "next/link";
import { useState } from "react";
import { createPasswordResetToken, findUser } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [tokenLink, setTokenLink] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setTokenLink(null);

    const user = findUser(username);
    if (!user) {
      setMessage("Não encontramos este usuário. Verifique o nome de usuário.");
      return;
    }

    const token = createPasswordResetToken(user.username);
    if (!token) {
      setMessage("Não foi possível gerar o link de recuperação.");
      return;
    }

    const link = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`;
    setTokenLink(link);
    setMessage("Enviamos as instruções para redefinir sua senha. Use o link abaixo para concluir.");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Recuperação de senha</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Insira o nome de usuário para receber um link de recuperação.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome de usuário</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="CAOA"
              required
            />
          </label>

          {message && <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700/40 dark:bg-slate-950/40 dark:text-slate-200">{message}</div>}
          {tokenLink && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-200">
              <p className="font-medium">Link de redefinição gerado:</p>
              <a href={tokenLink} className="break-all text-primary hover:underline">
                {tokenLink}
              </a>
            </div>
          )}

          <button type="submit" className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
            Enviar link
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Voltar ao login
          </Link>
          <Link href="/register" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
