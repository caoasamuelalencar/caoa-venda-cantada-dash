"use client";

import { Check, ChevronLeft, ChevronRight, CircleHelp, Loader2, Pencil, Search, ShieldCheck, Trash2, UsersRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Role = {
  id: number;
  code: string;
  name: string;
  dataScope: string;
};

type ManagedUser = {
  id: number;
  name: string;
  email: string | null;
  department: string | null;
  jobTitle: string | null;
  regional: string | null;
  regionals: string[];
  active: boolean;
  lastLoginAt: string | null;
  roles: Role[];
};

type UserPage = {
  items: ManagedUser[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

type AccessContext = { userId: number; isAdmin: true };

type RegionalGroup = { code: string; regionals: string[] };
type RegionalOptions = { regionals: string[]; groups: RegionalGroup[] };

async function responseError(response: Response) {
  const body = await response.json().catch(() => null) as { message?: string } | null;
  return body?.message ?? "Não foi possível concluir a operação.";
}

function roleNames(roles: Role[]) {
  return roles.length ? roles.map((role) => role.name).join(", ") : "Sem perfil";
}

function hasAdmin(roles: Role[]) {
  return roles.some((role) => role.code === "ADMIN");
}

function regionalNames(user: Pick<ManagedUser, "regional" | "regionals">) {
  return user.regionals.length ? user.regionals.join(", ") : user.regional ?? "Não definida";
}

function normalizeRegionalSelection(regionals: string[]) {
  return Array.from(new Set(regionals.map((regional) => regional.trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right, "pt-BR", { sensitivity: "base" }));
}

const roleAccessDescriptions: Record<string, string> = {
  ADMIN: "Acesso total: gerencia usuários e perfis, consulta, cria, edita e exclui intenções, além de visualizar e exportar relatórios de todas as regionais.",
  MANAGER: "Acessa somente a própria Regional: pode criar, consultar e editar intenções, além de visualizar e exportar relatórios da sua Regional.",
  USER: "Acessa somente os próprios registros: pode criar, consultar e editar as intenções que ele mesmo cadastrou.",
  VIEWER: "Acessa somente a própria Regional em modo de consulta: pode visualizar intenções e relatórios, sem criar, editar, excluir ou exportar.",
};

function RoleOption({
  role,
  checked,
  ownAdmin,
  disabled,
  onToggle,
}: {
  role: Role;
  checked: boolean;
  ownAdmin: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const description = roleAccessDescriptions[role.code] ?? "Consulte o administrador para conhecer as permissões deste perfil.";

  return (
    <div className={`flex items-start rounded-xl border ${checked ? "border-sky-300 bg-sky-50 dark:border-cyan-800 dark:bg-cyan-400/10" : "border-slate-200 dark:border-slate-800"}`}>
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-3">
        <input type="checkbox" checked={checked} disabled={ownAdmin || disabled} onChange={onToggle} className="mt-0.5 h-4 w-4 accent-sky-600" />
        <span className="min-w-0"><span className="block text-sm font-medium text-slate-900 dark:text-white">{role.name}</span><span className="block text-xs text-slate-500">{role.code} · escopo {role.dataScope}</span>{ownAdmin ? <span className="mt-1 block text-xs text-amber-700 dark:text-amber-300">Seu perfil ADMIN não pode ser removido.</span> : null}</span>
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" title={description} aria-label={`Ver acessos de ${role.name}`} className="m-2 inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 dark:border-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/20">
            <CircleHelp size={14} />Ver acessos
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom" sideOffset={6} className="z-[100] text-xs leading-5">
          <p className="font-semibold text-slate-900 dark:text-white">{role.name}</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{description}</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RegionalSelector({
  options,
  selected,
  disabled,
  onChange,
}: {
  options: RegionalOptions;
  selected: string[];
  disabled: boolean;
  onChange: (regionals: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleUpperCase("pt-BR");
  const visibleRegionals = options.regionals.filter((regional) => !normalizedSearch || regional.toLocaleUpperCase("pt-BR").includes(normalizedSearch));
  const selectedKeys = new Set(selected.map((regional) => regional.toLocaleUpperCase("pt-BR")));

  function toggleRegional(regional: string) {
    const key = regional.toLocaleUpperCase("pt-BR");
    onChange(selectedKeys.has(key) ? selected.filter((item) => item.toLocaleUpperCase("pt-BR") !== key) : normalizeRegionalSelection([...selected, regional]));
  }

  function toggleGroup(group: RegionalGroup) {
    const everySelected = group.regionals.every((regional) => selectedKeys.has(regional.toLocaleUpperCase("pt-BR")));
    onChange(everySelected
      ? selected.filter((regional) => !group.regionals.some((item) => item.toLocaleUpperCase("pt-BR") === regional.toLocaleUpperCase("pt-BR")))
      : normalizeRegionalSelection([...selected, ...group.regionals]));
  }

  return (
    <fieldset className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <legend className="px-1 text-sm font-medium text-slate-900 dark:text-white">Regionais</legend>
      <p className="mt-1 text-xs text-slate-500">Selecione uma ou mais Regionais. Os grupos adicionam suas Regionais à seleção; “A definir” não integra nenhum grupo.</p>
      <div className="mt-3 flex flex-wrap gap-2">{options.groups.map((group) => <label key={group.code} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-800 dark:border-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200"><input type="checkbox" checked={group.regionals.every((regional) => selectedKeys.has(regional.toLocaleUpperCase("pt-BR")))} disabled={disabled} onChange={() => toggleGroup(group)} className="h-3.5 w-3.5 accent-sky-600" />Grupo {group.code}</label>)}</div>
      <input value={search} onChange={(event) => setSearch(event.target.value)} disabled={disabled} placeholder="Buscar Regional" className="mt-3 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-900" />
      <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">{visibleRegionals.map((regional) => <label key={regional} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5"><input type="checkbox" checked={selectedKeys.has(regional.toLocaleUpperCase("pt-BR"))} disabled={disabled} onChange={() => toggleRegional(regional)} className="h-4 w-4 accent-sky-600" />{regional}</label>)}{!visibleRegionals.length ? <p className="px-2 py-1 text-xs text-slate-500">Nenhuma Regional encontrada.</p> : null}</div>
      <p className="mt-2 text-xs text-slate-500">{selected.length ? `${selected.length} Regional(is) selecionada(s): ${selected.join(", ")}` : "Nenhuma Regional selecionada."}</p>
    </fieldset>
  );
}

export default function AccessManagementPage() {
  const router = useRouter();
  const [context, setContext] = useState<AccessContext | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [regionalOptions, setRegionalOptions] = useState<RegionalOptions>({ regionals: [], groups: [] });
  const [users, setUsers] = useState<UserPage | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
  const [selectedRegionals, setSelectedRegionals] = useState<string[]>([]);
  const [selectedActive, setSelectedActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [userPendingDeletion, setUserPendingDeletion] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async (requestedPage = page) => {
    const query = new URLSearchParams({ page: String(requestedPage), pageSize: "20" });
    if (search.trim()) query.set("search", search.trim());
    if (role) query.set("role", role);
    if (status) query.set("active", status);

    const response = await fetch(`/api/users/access-management?${query}`, { cache: "no-store" });
    if (response.status === 401 || response.status === 403) {
      router.replace("/access-denied");
      return;
    }
    if (!response.ok) throw new Error(await responseError(response));
    setUsers(await response.json() as UserPage);
  }, [page, role, router, search, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contextResponse = await fetch("/api/users/access-management/context", { cache: "no-store" });
      if (contextResponse.status === 401 || contextResponse.status === 403) {
        router.replace("/access-denied");
        return;
      }
      if (!contextResponse.ok) throw new Error(await responseError(contextResponse));
      setContext(await contextResponse.json() as AccessContext);

      const rolesResponse = await fetch("/api/users/roles", { cache: "no-store" });
      if (!rolesResponse.ok) throw new Error(await responseError(rolesResponse));
      setRoles(await rolesResponse.json() as Role[]);
      const regionalsResponse = await fetch("/api/users/access-management/regionals", { cache: "no-store" });
      if (regionalsResponse.ok) {
        setRegionalOptions(await regionalsResponse.json() as RegionalOptions);
      } else {
        setRegionalOptions({ regionals: [], groups: [] });
      }
      await loadUsers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a gestão de acessos.");
    } finally {
      setLoading(false);
    }
  }, [loadUsers, router]);

  useEffect(() => {
    void load();
  }, [load]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setNotice(null);
    void loadUsers(1).catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível filtrar usuários."));
  }

  function openEditor(user: ManagedUser) {
    setSelectedUser(user);
    setSelectedRoleCodes(user.roles.map((item) => item.code));
    setSelectedRegionals(user.regionals.length ? user.regionals : user.regional ? [user.regional] : []);
    setSelectedActive(user.active);
    setError(null);
    setNotice(null);
  }

  function toggleRole(code: string) {
    if (!selectedUser) return;
    const isOwnAdmin = selectedUser.id === context?.userId && code === "ADMIN" && selectedRoleCodes.includes(code);
    if (isOwnAdmin) {
      setError("Você não pode remover o seu próprio acesso de administrador.");
      return;
    }
    setSelectedRoleCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  async function saveChanges() {
    if (!selectedUser || !selectedRoleCodes.length) {
      setError("Selecione pelo menos um perfil.");
      return;
    }
    const requiresRegional = selectedRoleCodes.some(
      (code) => code === "MANAGER" || code === "VIEWER",
    );
    if (requiresRegional && !selectedRegionals.length) {
      setError("Gestor regional e Visualizador regional exigem uma Regional configurada.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const currentCodes = selectedUser.roles.map((item) => item.code).sort().join("|");
      const nextCodes = [...selectedRoleCodes].sort().join("|");
      const currentRegionals = normalizeRegionalSelection(selectedUser.regionals.length ? selectedUser.regionals : selectedUser.regional ? [selectedUser.regional] : []);
      const nextRegionals = normalizeRegionalSelection(selectedRegionals);
      if (currentRegionals.join("|") !== nextRegionals.join("|")) {
        const regionalResponse = await fetch(`/api/users/${selectedUser.id}/regionals`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ regionals: nextRegionals }),
        });
        if (!regionalResponse.ok) throw new Error(await responseError(regionalResponse));
      }
      if (currentCodes !== nextCodes) {
        const rolesResponse = await fetch(`/api/users/${selectedUser.id}/roles`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ roles: selectedRoleCodes }),
        });
        if (!rolesResponse.ok) throw new Error(await responseError(rolesResponse));
      }
      if (selectedUser.active !== selectedActive) {
        const statusResponse = await fetch(`/api/users/${selectedUser.id}/status`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ active: selectedActive }),
        });
        if (!statusResponse.ok) throw new Error(await responseError(statusResponse));
      }
      setConfirming(false);
      setSelectedUser(null);
      setNotice("Acesso do usuário atualizado com sucesso.");
      await loadUsers();
    } catch (cause) {
      setConfirming(false);
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o acesso.");
    } finally {
      setSaving(false);
    }
  }

  function requestSave() {
    if (!selectedUser) return;
    const currentAdmin = hasAdmin(selectedUser.roles);
    const nextAdmin = selectedRoleCodes.includes("ADMIN");
    if (currentAdmin !== nextAdmin || (currentAdmin && !selectedActive)) {
      setConfirming(true);
      return;
    }
    void saveChanges();
  }

  function requestDelete(user: ManagedUser) {
    if (user.id === context?.userId) {
      setError("Você não pode excluir a sua própria conta.");
      return;
    }
    setError(null);
    setNotice(null);
    setUserPendingDeletion(user);
  }

  async function deleteUser() {
    if (!userPendingDeletion) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userPendingDeletion.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      if (selectedUser?.id === userPendingDeletion.id) setSelectedUser(null);
      setNotice(`Usuário ${userPendingDeletion.name} excluído com sucesso.`);
      setUserPendingDeletion(null);
      await loadUsers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível excluir o usuário.");
    } finally {
      setDeleting(false);
    }
  }

  const canGoBack = Boolean(users && users.page > 1);
  const canGoForward = Boolean(users && users.page < users.pageCount);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sky-700 dark:text-cyan-300"><ShieldCheck size={20} /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Administração</span></div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Gestão de Acessos</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Gerencie os usuários e seus perfis de acesso ao sistema.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-cyan-400/10 dark:text-cyan-200"><UsersRound size={18} />{users ? `${users.total} usuário${users.total === 1 ? "" : "s"}` : "Carregando"}</div>
        </div>
      </section>

      {notice ? <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200"><Check size={18} />{notice}</div> : null}
      {error && !selectedUser ? <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">{error}</div> : null}

      <form onSubmit={applyFilters} className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[minmax(0,1fr)_180px_150px_auto]">
        <label className="relative block"><span className="sr-only">Buscar por nome ou e-mail</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-900" /></label>
        <select value={role} onChange={(event) => setRole(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="">Todos os perfis</option>{roles.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Inativos</option></select>
        <button type="submit" className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">Filtrar</button>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={20} />Carregando usuários...</div> : users?.items.length ? <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70"><tr><th className="px-5 py-4">Usuário</th><th className="px-5 py-4">Regional</th><th className="px-5 py-4">Perfis</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Ações</th></tr></thead><tbody>{users.items.map((user) => <tr key={user.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-5 py-4"><p className="font-medium text-slate-900 dark:text-white">{user.name}</p><p className="mt-0.5 text-xs text-slate-500">{user.email ?? "E-mail não informado"}</p></td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{regionalNames(user)}</td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{roleNames(user.roles)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{user.active ? "Ativo" : "Inativo"}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => openEditor(user)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 dark:text-cyan-300 dark:hover:bg-cyan-400/10"><Pencil size={16} />Editar</button><button type="button" onClick={() => requestDelete(user)} disabled={user.id === context?.userId} title={user.id === context?.userId ? "Você não pode excluir sua própria conta" : "Excluir usuário"} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-300 dark:hover:bg-rose-400/10"><Trash2 size={16} />Excluir</button></td></tr>)}</tbody></table></div>
          <div className="grid gap-3 p-4 md:hidden">{users.items.map((user) => <article key={user.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-start justify-between gap-3"><div><h2 className="font-medium text-slate-900 dark:text-white">{user.name}</h2><p className="mt-1 break-all text-xs text-slate-500">{user.email ?? "E-mail não informado"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${user.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{user.active ? "Ativo" : "Inativo"}</span></div><dl className="mt-4 grid gap-2 text-sm"><div><dt className="text-xs uppercase tracking-wide text-slate-500">Regional</dt><dd className="text-slate-700 dark:text-slate-200">{regionalNames(user)}</dd></div><div><dt className="text-xs uppercase tracking-wide text-slate-500">Perfis</dt><dd className="text-slate-700 dark:text-slate-200">{roleNames(user.roles)}</dd></div></dl><button type="button" onClick={() => openEditor(user)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 dark:text-cyan-300"><Pencil size={16} />Editar</button></article>)}</div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800"><span className="text-slate-500">Página {users.page} de {users.pageCount}</span><div className="flex gap-2"><button type="button" disabled={!canGoBack} onClick={() => { const next = page - 1; setPage(next); void loadUsers(next); }} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"><ChevronLeft size={16} />Anterior</button><button type="button" disabled={!canGoForward} onClick={() => { const next = page + 1; setPage(next); void loadUsers(next); }} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700">Próxima<ChevronRight size={16} /></button></div></div>
        </> : <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><UsersRound className="mb-3 text-slate-400" size={30} /><h2 className="font-medium text-slate-900 dark:text-white">Nenhum usuário encontrado</h2><p className="mt-1 text-sm text-slate-500">Ajuste os filtros ou aguarde o primeiro acesso de um usuário ao sistema.</p></div>}
      </section>

      {selectedUser ? <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/45" role="dialog" aria-modal="true" aria-labelledby="access-editor-title"><button type="button" aria-label="Fechar edição" className="absolute inset-0" onClick={() => !saving && setSelectedUser(null)} /><section className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-950 sm:p-6"><div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700 dark:text-cyan-300">Gestão de Acessos</p><h2 id="access-editor-title" className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Editar</h2></div><button type="button" disabled={saving} onClick={() => setSelectedUser(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-900"><X size={18} /></button></div><div className="space-y-5 py-5"><div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900"><p className="font-medium text-slate-900 dark:text-white">{selectedUser.name}</p><p className="mt-1 break-all text-slate-500">{selectedUser.email ?? "E-mail não informado"}</p><p className="mt-2 text-slate-600 dark:text-slate-300">Perfis atuais: {roleNames(selectedUser.roles)}</p></div><RegionalSelector options={regionalOptions} selected={selectedRegionals} disabled={saving} onChange={setSelectedRegionals} /><fieldset><legend className="text-sm font-medium text-slate-900 dark:text-white">Novos perfis</legend><p className="mt-1 text-xs text-slate-500">Selecione um ou mais perfis cadastrados.</p><div className="mt-3 space-y-2">{roles.map((item) => <RoleOption key={item.id} role={item} checked={selectedRoleCodes.includes(item.code)} ownAdmin={selectedUser.id === context?.userId && item.code === "ADMIN" && selectedRoleCodes.includes(item.code)} disabled={saving} onToggle={() => toggleRole(item.code)} />)}</div></fieldset><label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"><span><span className="block font-medium text-slate-900 dark:text-white">Usuário ativo</span><span className="block text-xs text-slate-500">Usuários inativos não conseguem acessar o sistema.</span></span><input type="checkbox" checked={selectedActive} disabled={saving || (selectedUser.id === context?.userId && hasAdmin(selectedUser.roles))} onChange={(event) => setSelectedActive(event.target.checked)} className="h-4 w-4 accent-sky-600" /></label>{error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">{error}</p> : null}</div><div className="mt-auto flex flex-wrap gap-3 border-t border-slate-200 pt-4 dark:border-slate-800"><button type="button" disabled={saving || selectedUser.id === context?.userId} onClick={() => requestDelete(selectedUser)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900 dark:text-rose-300"><Trash2 size={16} />Excluir</button><button type="button" disabled={saving} onClick={() => setSelectedUser(null)} className="h-10 flex-1 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-50 dark:border-slate-700">Cancelar</button><button type="button" disabled={saving} onClick={requestSave} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-medium text-white disabled:opacity-50"><>{saving ? <Loader2 className="animate-spin" size={16} /> : null}Salvar alterações</></button></div></section></div> : null}

      {confirming && selectedUser ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-access-title"><section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-950"><h2 id="confirm-access-title" className="text-lg font-semibold text-slate-950 dark:text-white">Confirmar alteração sensível</h2><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Você está alterando o acesso de <strong>{selectedUser.name}</strong>{selectedRoleCodes.includes("ADMIN") ? " para incluir o perfil ADMIN" : " para remover o perfil ADMIN ou desativar o usuário"}. Deseja continuar?</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setConfirming(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium dark:border-slate-700">Cancelar</button><button type="button" disabled={saving} onClick={() => void saveChanges()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-medium text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16} /> : null}Confirmar</button></div></section></div> : null}
      {userPendingDeletion ? <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title">
        <section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-950">
          <h2 id="delete-user-title" className="text-lg font-semibold text-slate-950 dark:text-white">Excluir usuário?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Esta ação é permanente. O acesso de <strong>{userPendingDeletion.name}</strong> será removido. As intenções históricas serão preservadas com o proprietário já registrado.</p>
          <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={deleting} onClick={() => setUserPendingDeletion(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium disabled:opacity-50 dark:border-slate-700">Cancelar</button><button type="button" disabled={deleting} onClick={() => void deleteUser()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">{deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}Excluir</button></div>
        </section>
      </div> : null}
    </main>
  );
}
