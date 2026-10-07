"use client";

import { Check, ChevronLeft, ChevronRight, CircleHelp, Loader2, Pencil, Search, ShieldCheck, Trash2, UsersRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Role = { id: number; code: string; name: string };
type Screen = { id: number; code: string; name: string; path: string };
type ManagedUser = { id: number; name: string; email: string | null; active: boolean; roles: Role[]; screens: string[] };
type UserPage = { items: ManagedUser[]; page: number; pageCount: number; total: number };
type AccessContext = { userId: number; isAdmin: true };

const roleDescriptions: Record<string, string> = {
  ADMIN: "Gerencia usuários e perfis e possui todas as permissões da plataforma.",
  MANAGER: "Cria, consulta e edita intenções; também visualiza e exporta relatórios.",
  USER: "Cria, consulta e edita intenções.",
  VIEWER: "Consulta intenções e relatórios.",
};

function roleNames(roles: Role[]) {
  return roles.length ? roles.map((role) => role.name).join(", ") : "Sem perfil";
}

async function responseError(response: Response) {
  const body = await response.json().catch(() => null) as { message?: string } | null;
  return body?.message ?? "Não foi possível concluir a operação.";
}

function RoleOption({ role, checked, ownAdmin, disabled, onToggle }: {
  role: Role; checked: boolean; ownAdmin: boolean; disabled: boolean; onToggle: () => void;
}) {
  const description = roleDescriptions[role.code] ?? "Consulte o administrador para conhecer as permissões deste perfil.";
  return <div className={`flex items-start rounded-xl border ${checked ? "border-sky-300 bg-sky-50 dark:border-cyan-800 dark:bg-cyan-400/10" : "border-slate-200 dark:border-slate-800"}`}>
    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-3">
      <input type="checkbox" checked={checked} disabled={ownAdmin || disabled} onChange={onToggle} className="mt-0.5 h-4 w-4 accent-sky-600" />
      <span className="min-w-0"><span className="block text-sm font-medium text-slate-900 dark:text-white">{role.name}</span><span className="block text-xs text-slate-500">{role.code}</span>{ownAdmin ? <span className="mt-1 block text-xs text-amber-700 dark:text-amber-300">Seu perfil ADMIN não pode ser removido.</span> : null}</span>
    </label>
    <Popover><PopoverTrigger asChild><button type="button" title={description} aria-label={`Ver acessos de ${role.name}`} className="m-2 inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs font-medium text-sky-700 dark:border-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200"><CircleHelp size={14} />Ver acessos</button></PopoverTrigger><PopoverContent align="end" side="bottom" sideOffset={6} className="z-[100] text-xs leading-5"><p className="font-semibold text-slate-900 dark:text-white">{role.name}</p><p className="mt-1 text-slate-600 dark:text-slate-300">{description}</p></PopoverContent></Popover>
  </div>;
}

function ScreenOption({ screen, checked, disabled, onToggle }: {
  screen: Screen; checked: boolean; disabled: boolean; onToggle: () => void;
}) {
  return <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${checked ? "border-sky-300 bg-sky-50 dark:border-cyan-800 dark:bg-cyan-400/10" : "border-slate-200 dark:border-slate-800"}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} className="mt-0.5 h-4 w-4 accent-sky-600" />
    <span><span className="block text-sm font-medium text-slate-900 dark:text-white">{screen.name}</span><span className="block text-xs text-slate-500">{screen.path}</span></span>
  </label>;
}

export default function AccessManagementPage() {
  const router = useRouter();
  const [context, setContext] = useState<AccessContext | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
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
  const [selectedScreenCodes, setSelectedScreenCodes] = useState<string[]>([]);
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
    if (response.status === 401 || response.status === 403) return router.replace("/access-denied");
    if (!response.ok) throw new Error(await responseError(response));
    setUsers(await response.json() as UserPage);
  }, [page, role, router, search, status]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [contextResponse, rolesResponse, screensResponse] = await Promise.all([
        fetch("/api/users/access-management/context", { cache: "no-store" }),
        fetch("/api/users/roles", { cache: "no-store" }),
        fetch("/api/users/screens", { cache: "no-store" }),
      ]);
      if (contextResponse.status === 401 || contextResponse.status === 403) return router.replace("/access-denied");
      if (!contextResponse.ok) throw new Error(await responseError(contextResponse));
      if (!rolesResponse.ok) throw new Error(await responseError(rolesResponse));
      if (!screensResponse.ok) throw new Error(await responseError(screensResponse));
      setContext(await contextResponse.json() as AccessContext);
      setRoles(await rolesResponse.json() as Role[]);
      setScreens(await screensResponse.json() as Screen[]);
      await loadUsers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a gestão de acessos.");
    } finally { setLoading(false); }
  }, [loadUsers, router]);

  useEffect(() => { void load(); }, [load]);

  function openEditor(user: ManagedUser) {
    setSelectedUser(user); setSelectedRoleCodes(user.roles.map((item) => item.code)); setSelectedScreenCodes(user.screens); setSelectedActive(user.active); setError(null); setNotice(null);
  }

  function toggleRole(code: string) {
    if (!selectedUser) return;
    if (selectedUser.id === context?.userId && code === "ADMIN" && selectedRoleCodes.includes(code)) {
      setError("Você não pode remover o seu próprio acesso de administrador.");
      return;
    }
    setSelectedRoleCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
    if (code === "ADMIN" && selectedRoleCodes.includes(code)) {
      setSelectedScreenCodes((current) => current.filter((item) => item !== "ACCESS_MANAGEMENT"));
    }
  }

  function toggleScreen(code: string) {
    setSelectedScreenCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  async function saveChanges() {
    if (!selectedUser || !selectedRoleCodes.length) return setError("Selecione pelo menos um perfil.");
    setSaving(true); setError(null);
    try {
      const currentRoles = selectedUser.roles.map((item) => item.code).sort().join("|");
      const nextRoles = [...selectedRoleCodes].sort().join("|");
      if (currentRoles !== nextRoles) {
        const response = await fetch(`/api/users/${selectedUser.id}/roles`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ roles: selectedRoleCodes }) });
        if (!response.ok) throw new Error(await responseError(response));
      }
      const currentScreens = [...selectedUser.screens].sort().join("|");
      const nextScreens = [...selectedScreenCodes].sort().join("|");
      if (currentScreens !== nextScreens) {
        const response = await fetch(`/api/users/${selectedUser.id}/screens`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ screens: selectedScreenCodes }) });
        if (!response.ok) throw new Error(await responseError(response));
      }
      if (selectedUser.active !== selectedActive) {
        const response = await fetch(`/api/users/${selectedUser.id}/status`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active: selectedActive }) });
        if (!response.ok) throw new Error(await responseError(response));
      }
      setConfirming(false); setSelectedUser(null); setNotice("Acesso do usuário atualizado com sucesso."); await loadUsers();
    } catch (cause) {
      setConfirming(false); setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o acesso.");
    } finally { setSaving(false); }
  }

  async function deleteUser() {
    if (!userPendingDeletion) return;
    setDeleting(true); setError(null);
    try {
      const response = await fetch(`/api/users/${userPendingDeletion.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      setNotice(`Usuário ${userPendingDeletion.name} excluído com sucesso.`); setUserPendingDeletion(null); await loadUsers();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir o usuário."); } finally { setDeleting(false); }
  }

  const isCurrentAdmin = Boolean(selectedUser?.roles.some((item) => item.code === "ADMIN"));
  const shouldConfirm = Boolean(selectedUser && (isCurrentAdmin !== selectedRoleCodes.includes("ADMIN") || (isCurrentAdmin && !selectedActive)));

  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-sky-700 dark:text-cyan-300"><ShieldCheck size={20} /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Administração</span></div><h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Gestão de Acessos</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Gerencie os usuários e seus perfis de acesso ao sistema.</p></div><div className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-cyan-400/10 dark:text-cyan-200"><UsersRound size={18} />{users ? `${users.total} usuário${users.total === 1 ? "" : "s"}` : "Carregando"}</div></div></section>
    {notice ? <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check size={18} />{notice}</div> : null}
    {error && !selectedUser ? <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
    <form onSubmit={(event) => { event.preventDefault(); setPage(1); void loadUsers(1).catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível filtrar usuários.")); }} className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[minmax(0,1fr)_180px_150px_auto]"><label className="relative block"><span className="sr-only">Buscar por nome ou e-mail</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label><select value={role} onChange={(event) => setRole(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="">Todos os perfis</option>{roles.map((item) => <option key={item.id} value={item.code}>{item.name}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Inativos</option></select><button type="submit" className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-medium text-white">Filtrar</button></form>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">{loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={20} />Carregando usuários...</div> : users?.items.length ? <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70"><tr><th className="px-5 py-4">Usuário</th><th className="px-5 py-4">Perfis</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Ações</th></tr></thead><tbody>{users.items.map((user) => <tr key={user.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-5 py-4"><p className="font-medium text-slate-900 dark:text-white">{user.name}</p><p className="mt-0.5 text-xs text-slate-500">{user.email ?? "E-mail não informado"}</p></td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{roleNames(user.roles)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{user.active ? "Ativo" : "Inativo"}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => openEditor(user)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-sky-700"><Pencil size={16} />Editar</button><button type="button" onClick={() => setUserPendingDeletion(user)} disabled={user.id === context?.userId} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={16} />Excluir</button></td></tr>)}</tbody></table></div><div className="grid gap-3 p-4 md:hidden">{users.items.map((user) => <article key={user.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-start justify-between gap-3"><div><h2 className="font-medium text-slate-900 dark:text-white">{user.name}</h2><p className="mt-1 break-all text-xs text-slate-500">{user.email ?? "E-mail não informado"}</p></div><span className="shrink-0 text-xs">{user.active ? "Ativo" : "Inativo"}</span></div><dl className="mt-4 grid gap-2 text-sm"><div><dt className="text-xs uppercase tracking-wide text-slate-500">Perfis</dt><dd className="text-slate-700 dark:text-slate-200">{roleNames(user.roles)}</dd></div></dl><button type="button" onClick={() => openEditor(user)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700"><Pencil size={16} />Editar</button></article>)}</div><div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800"><span className="text-slate-500">Página {users.page} de {users.pageCount}</span><div className="flex gap-2"><button type="button" disabled={users.page <= 1} onClick={() => { const next = page - 1; setPage(next); void loadUsers(next); }} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 disabled:opacity-40"><ChevronLeft size={16} />Anterior</button><button type="button" disabled={users.page >= users.pageCount} onClick={() => { const next = page + 1; setPage(next); void loadUsers(next); }} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 disabled:opacity-40">Próxima<ChevronRight size={16} /></button></div></div></> : <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><UsersRound className="mb-3 text-slate-400" size={30} /><h2 className="font-medium text-slate-900 dark:text-white">Nenhum usuário encontrado</h2></div>}</section>
    {selectedUser ? <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/45" role="dialog" aria-modal="true"><button type="button" aria-label="Fechar edição" className="absolute inset-0" onClick={() => !saving && setSelectedUser(null)} /><section className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-950 sm:p-6"><div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700 dark:text-cyan-300">Gestão de Acessos</p><h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Editar</h2></div><button type="button" disabled={saving} onClick={() => setSelectedUser(null)} className="rounded-lg p-2 text-slate-500"><X size={18} /></button></div><div className="space-y-5 py-5"><div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900"><p className="font-medium text-slate-900 dark:text-white">{selectedUser.name}</p><p className="mt-1 break-all text-slate-500">{selectedUser.email ?? "E-mail não informado"}</p><p className="mt-2 text-slate-600 dark:text-slate-300">Perfis atuais: {roleNames(selectedUser.roles)}</p></div><fieldset><legend className="text-sm font-medium text-slate-900 dark:text-white">Novos perfis</legend><div className="mt-3 space-y-2">{roles.map((item) => <RoleOption key={item.id} role={item} checked={selectedRoleCodes.includes(item.code)} ownAdmin={selectedUser.id === context?.userId && item.code === "ADMIN" && selectedRoleCodes.includes(item.code)} disabled={saving} onToggle={() => toggleRole(item.code)} />)}</div></fieldset><fieldset><legend className="text-sm font-medium text-slate-900 dark:text-white">Telas liberadas</legend><p className="mt-1 text-xs text-slate-500">Selecione as telas que este usuário poderá acessar.</p><div className="mt-3 space-y-2">{screens.map((item) => <ScreenOption key={item.id} screen={item} checked={selectedScreenCodes.includes(item.code)} disabled={saving} onToggle={() => toggleScreen(item.code)} />)}</div></fieldset><label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"><span><span className="block font-medium text-slate-900 dark:text-white">Usuário ativo</span><span className="block text-xs text-slate-500">Usuários inativos não conseguem acessar o sistema.</span></span><input type="checkbox" checked={selectedActive} disabled={saving || (selectedUser.id === context?.userId && isCurrentAdmin)} onChange={(event) => setSelectedActive(event.target.checked)} className="h-4 w-4 accent-sky-600" /></label>{error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p> : null}</div><div className="mt-auto flex flex-wrap gap-3 border-t border-slate-200 pt-4 dark:border-slate-800"><button type="button" disabled={saving || selectedUser.id === context?.userId} onClick={() => setUserPendingDeletion(selectedUser)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-sm font-medium text-rose-700 disabled:opacity-40"><Trash2 size={16} />Excluir</button><button type="button" disabled={saving} onClick={() => setSelectedUser(null)} className="h-10 flex-1 rounded-xl border border-slate-200 text-sm font-medium">Cancelar</button><button type="button" disabled={saving} onClick={() => shouldConfirm ? setConfirming(true) : void saveChanges()} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-medium text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16} /> : null}Salvar alterações</button></div></section></div> : null}
    {confirming && selectedUser ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true"><section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-950"><h2 className="text-lg font-semibold text-slate-950 dark:text-white">Confirmar alteração sensível</h2><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Você está alterando o acesso de <strong>{selectedUser.name}</strong>. Deseja continuar?</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setConfirming(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium">Cancelar</button><button type="button" disabled={saving} onClick={() => void saveChanges()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-medium text-white">{saving ? <Loader2 className="animate-spin" size={16} /> : null}Confirmar</button></div></section></div> : null}
    {userPendingDeletion ? <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4" role="alertdialog" aria-modal="true"><section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-950"><h2 className="text-lg font-semibold text-slate-950 dark:text-white">Excluir usuário?</h2><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Esta ação é permanente. O acesso de <strong>{userPendingDeletion.name}</strong> será removido.</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={deleting} onClick={() => setUserPendingDeletion(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium">Cancelar</button><button type="button" disabled={deleting} onClick={() => void deleteUser()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white">{deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}Excluir</button></div></section></div> : null}
  </main>;
}
