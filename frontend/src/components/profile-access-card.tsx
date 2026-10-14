"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { protectedScreens } from "@/lib/screen-access";

type AccessProfile = {
  roles: string[];
  screens: string[];
};

const roleDetails: Record<string, { name: string; description: string }> = {
  ADMIN: { name: "Administrador", description: "Gerencia acessos e possui todas as permissões da plataforma." },
  MANAGER: { name: "Gestor", description: "Opera intenções e relatórios conforme suas permissões." },
  USER: { name: "Usuário", description: "Opera intenções conforme suas permissões." },
  VIEWER: { name: "Visualizador", description: "Consulta intenções e relatórios conforme suas permissões." },
};

const screenDetails: Record<string, { name: string; path: string }> = Object.fromEntries(
  protectedScreens.map((screen) => [screen.code, screen]),
);

export default function ProfileAccessCard() {
  const [access, setAccess] = useState<AccessProfile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/perfil/acesso", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar acesso");
        return response.json() as Promise<AccessProfile>;
      })
      .then((data) => {
        if (active) setAccess(data);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl bg-slate-50/80 dark:bg-white/5">
      <h3 className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-base font-normal text-slate-950 dark:border-white/10 dark:text-white">
        <ShieldCheck className="h-4 w-4 text-sky-700 dark:text-cyan-300" />
        Acesso na plataforma
      </h3>
      {error ? (
        <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">Não foi possível carregar seus dados de acesso.</p>
      ) : !access ? (
        <p className="px-4 py-3 text-sm text-slate-500">Carregando dados de acesso...</p>
      ) : (
        <dl className="divide-y divide-slate-200 dark:divide-white/10">
          <div className="px-4 py-3"><dt className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Perfis</dt><dd className="mt-2 flex flex-wrap gap-2">{access.roles.map((role) => <span key={role} title={roleDetails[role]?.description} className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">{roleDetails[role]?.name ?? role}</span>)}</dd></div>
          <div className="px-4 py-3"><dt className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Telas liberadas</dt><dd className="mt-2 flex flex-wrap gap-2">{access.screens.length ? access.screens.map((code) => { const screen = screenDetails[code]; return <span key={code} title={screen?.path ?? code} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">{screen?.name ?? code}</span>; }) : <span className="text-sm text-slate-500 dark:text-slate-400">Nenhuma tela liberada.</span>}</dd></div>
        </dl>
      )}
    </section>
  );
}
