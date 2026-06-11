"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Home, LogIn } from "lucide-react";

export default function AccessDeniedPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Erro ao conectar com o provedor de autenticação.",
    OAuthCallback: "Erro ao processar a autenticação OAuth.",
    OAuthCreateAccount: "Erro ao criar conta durante autenticação.",
    EmailCreateAccount: "Erro ao criar conta com email.",
    Callback: "Erro ao processar callback de autenticação.",
    EmailSignInError: "Erro ao enviar email de autenticação.",
    CredentialsSignin: "Credenciais inválidas.",
    SessionCallback: "Erro ao criar sessão.",
    AccessDenied: "Acesso negado. Você não tem permissão para acessar este recurso.",
    Verification: "Token de verificação inválido ou expirado.",
  };

  const message = errorMessages[error as string] || "Acesso negado. Você não tem permissão para acessar este recurso.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4 dark:from-red-950 dark:to-red-900">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl dark:border-red-800 dark:bg-slate-900">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-red-600 dark:text-red-400">
          Acesso Negado
        </h1>

        {/* Message */}
        <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {message}
        </p>

        {/* Error Details */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-xs font-mono text-red-700 dark:text-red-300">
              Código do erro: <strong>{error}</strong>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <LogIn className="h-4 w-4" />
            Tentar Login Novamente
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Home className="h-4 w-4" />
            Voltar para Home
          </Link>
        </div>

        {/* Footer Info */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Se o problema persistir, entre em contato com o administrador do sistema.
        </p>
      </div>
    </div>
  );
}
