"use client";

import { useEffect, useMemo, useState } from "react";
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

function getDisplayName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastNameInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${firstName} ${lastNameInitial}`;
}

function getAvatarInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";

  const first = parts[0][0]?.toUpperCase() ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() ?? "" : "";

  return `${first}${last}`;
}

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
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

  const resolvedName = session?.user?.name || username;
  const displayName = resolvedName ? getDisplayName(resolvedName) : "Convidado";
  const initials = resolvedName ? getAvatarInitials(resolvedName) : "U";
  const avatarColor = useMemo(
    () => (resolvedName ? getAvatarColor(resolvedName) : "hsl(214, 15%, 35%)"),
    [resolvedName]
  );

  const hasPhoto = Boolean(session?.user?.image);
  const imageSrc = session?.user?.image || undefined;

  return (
    <div className="border-b border-border px-2 py-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800">
        {hasPhoto ? (
          <img
            src={imageSrc}
            alt={resolvedName ? `${resolvedName}` : "User"}
            className="h-9 w-9 rounded-full object-cover"
            width={36}
            height={36}
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: avatarColor }}
            aria-label={resolvedName ? `${initials} avatar` : "User avatar"}
          >
            {initials}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {displayName}
          </p>

        </div>
      </div>
    </div>
  );
}
