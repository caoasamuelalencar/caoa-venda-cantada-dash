"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getAuthUsername());
  }, []);

  return (
    <div className="border-b border-border px-2 py-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800">
        <Image
          src="/avatar.png"
          alt="User"
          className="rounded-full"
          width={36}
          height={36}
        />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {username ?? "Convidado"}
          </p>
          <p className="text-xs text-muted-foreground">{username ? "Usuário autenticado" : "Acesso não autenticado"}</p>
        </div>
      </div>
    </div>
  );
}
