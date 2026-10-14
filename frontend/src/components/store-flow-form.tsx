"use client";

import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { fetchSalesIntentionCatalogs, type SalesIntentionCatalogHierarchyRecord } from "@/lib/salesIntentionApi";
import { saveStoreFlow } from "@/lib/store-flow-api";

function distinctSorted(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
    .sort((first, second) => first.localeCompare(second, "pt-BR", { sensitivity: "base" }));
}

function formatToday() {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}

const fieldClasses =
  "min-h-11 w-full min-w-0 rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none ring-1 ring-transparent transition duration-150 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-80 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20 dark:disabled:bg-slate-900/80 sm:px-4";
const labelClasses = "flex flex-col gap-1.5 text-sm font-normal text-slate-700 dark:text-slate-300";
const pageCardClasses =
  "mx-auto w-full max-w-6xl overflow-visible rounded-3xl border border-slate-200/60 bg-white/95 shadow-sm dark:border-white/10 dark:bg-slate-950/80 dark:shadow-none";
const headerCardClasses =
  "rounded-t-[inherit] border-b border-slate-200/70 bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-500 p-4 text-white sm:p-5 dark:border-white/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700";

export default function StoreFlowForm() {
  const { user } = useCurrentUser();
  const [hierarchy, setHierarchy] = useState<SalesIntentionCatalogHierarchyRecord[]>([]);
  const [regional, setRegional] = useState("");
  const [lojaVenda, setLojaVenda] = useState("");
  const [fluxo, setFluxo] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;

    const timer = window.setTimeout(() => setSuccess(null), 5_000);
    return () => window.clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    let active = true;
    void fetchSalesIntentionCatalogs()
      .then((catalog) => {
        if (active) setHierarchy(catalog.hierarchy);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar as opções de regional e loja.");
      })
      .finally(() => {
        if (active) setLoadingCatalog(false);
      });
    return () => { active = false; };
  }, []);

  const regionalOptions = useMemo(
    () => distinctSorted(hierarchy.map((item) => item.regional)),
    [hierarchy],
  );
  const storeOptions = useMemo(
    () => distinctSorted(hierarchy.filter((item) => item.regional === regional).map((item) => item.lojaVenda)),
    [hierarchy, regional],
  );
  const userDescription = user?.email ?? user?.name ?? "Usuário autenticado";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const parsedFlow = Number(fluxo);
    if (!regional || !lojaVenda) {
      setError("Selecione a regional e a loja.");
      return;
    }
    if (!Number.isInteger(parsedFlow) || parsedFlow <= 0) {
      setError("Informe um fluxo de loja inteiro maior que zero.");
      return;
    }

    setSaving(true);
    try {
      await saveStoreFlow({ regional, lojaVenda, fluxo: parsedFlow });
      setSuccess("Informações salvas com sucesso.");
      setRegional("");
      setLojaVenda("");
      setFluxo("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar o fluxo de loja.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50 px-3 py-3 dark:bg-slate-950 sm:px-5 sm:py-4 lg:px-8">
      <section className={pageCardClasses}>
        <div className={headerCardClasses}>
          <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-normal uppercase tracking-[0.24em] text-white/90">
            Formulário
          </span>
          <h1 className="mt-3 text-3xl font-normal tracking-tight sm:text-4xl">Cadastro Fluxo Loja</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:grid-cols-12">
          <label className="md:col-span-2 xl:col-span-8">
            <span className={labelClasses}>Proprietário</span>
            <input readOnly value={userDescription} className={`${fieldClasses} mt-1.5`} />
          </label>

          <label className="md:col-span-2 xl:col-span-4">
            <span className={labelClasses}>Data e hora do registro</span>
            <input readOnly value={formatToday()} className={`${fieldClasses} mt-1.5`} />
          </label>

          <label className="md:col-span-1 xl:col-span-5">
            <span className={labelClasses}>Regional</span>
            <select value={regional} onChange={(event) => { setRegional(event.target.value); setLojaVenda(""); }} disabled={saving || loadingCatalog} className={`${fieldClasses} mt-1.5`}>
              <option value="">{loadingCatalog ? "Carregando regionais..." : "Escolha a regional"}</option>
              {regionalOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="md:col-span-1 xl:col-span-7">
            <span className={labelClasses}>Loja de Venda</span>
            <select value={lojaVenda} onChange={(event) => setLojaVenda(event.target.value)} disabled={!regional || saving || loadingCatalog} className={`${fieldClasses} mt-1.5`}>
              <option value="">{regional ? "Escolha a loja" : "Escolha a regional primeiro"}</option>
              {storeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="md:col-span-1 xl:col-span-4">
            <span className={labelClasses}>Fluxo de loja</span>
            <input type="number" inputMode="numeric" min="1" step="1" value={fluxo} onChange={(event) => setFluxo(event.target.value)} disabled={saving} placeholder="Informe a quantidade" className={`${fieldClasses} mt-1.5`} />
          </label>

          <div className="md:col-span-2 xl:col-span-8 xl:flex xl:items-end">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">O registro é referente ao dia atual. Ao salvar novamente para a mesma loja, o valor do dia será atualizado.</p>
          </div>

          {error ? <p role="alert" className="md:col-span-2 xl:col-span-12 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-950 dark:bg-rose-950/30 dark:text-rose-200">{error}</p> : null}
          {success ? <p role="status" className="md:col-span-2 xl:col-span-12 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200"><CheckCircle2 size={18} />{success}</p> : null}

          <button type="submit" disabled={saving || loadingCatalog} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-normal text-white transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 xl:col-span-12 xl:w-auto xl:justify-self-end">
            {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={17} />}
            {saving ? "Salvando..." : "Salvar fluxo"}
          </button>
        </form>
      </section>
    </main>
  );
}
