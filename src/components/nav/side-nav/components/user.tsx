"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function getAuthUsername() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("caoa-auth="));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] || "");
}

export default function User() {
  const { data: session } = useSession();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
      return;
    }

    setUsername(getAuthUsername());
  }, [session]);

  const imageSrc = session?.user?.image || "/avatar.png";

  return (
    <div className="border-b border-border px-2 py-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800">
        <img
          src={imageSrc}
          alt={session?.user?.name ? `${session.user.name}` : "User"}
          className="h-9 w-9 rounded-full object-cover"
          width={36}
          height={36}
        />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {username ?? "Convidado"}
          </p>
          <p className="text-xs text-muted-foreground">
            {session?.user?.email ? "Usuário autenticado" : "Acesso não autenticado"}
          </p>
        </div>
      </div>
    </div>
  );
}
