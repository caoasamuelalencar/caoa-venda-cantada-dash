"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type AccessProfile = {
  roles: string[];
  dataScope: "OWN" | "REGIONAL" | "ALL";
  regional: string | null;
  regionals: string[];
};

const roleDetails: Record<string, { name: string; description: string }> = {
  ADMIN: { name: "Administrador", description: "Gerencia acessos e consulta dados de todas as regionais." },
  MANAGER: { name: "Gestor regional", description: "Opera intenções e relatórios somente da própria Regional." },
  USER: { name: "Usuário", description: "Opera somente as intenções cadastradas por ele." },
  VIEWER: { name: "Visualizador regional", description: "Consulta intenções e relatórios somente da própria Regional." },
};

const scopeDescriptions: Record<AccessProfile["dataScope"], string> = {
  ALL: "Acesso aos dados de todas as regionais.",
  REGIONAL: "Acesso limitado aos dados da Regional atribuída.",
  OWN: "Acesso limitado aos registros criados por você.",
};

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
          <div className="px-4 py-3"><dt className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Escopo de dados</dt><dd className="mt-1 text-sm text-slate-900 dark:text-white">{scopeDescriptions[access.dataScope]}</dd></div>
          <div className="px-4 py-3"><dt className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Regionais</dt><dd className="mt-1 text-sm text-slate-900 dark:text-white">{access.dataScope === "ALL" ? "Todas as regionais" : access.regionals.length ? access.regionals.join(", ") : access.regional ?? "Não configurada"}</dd></div>
        </dl>
      )}
    </section>
  );
}
