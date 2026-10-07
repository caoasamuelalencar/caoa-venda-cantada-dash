import { buildBackendAuthorization, getBackendBaseUrls } from "@/app/api/_lib/backendProxy";

export async function hasScreenAccess(screenCode: string) {
  const authorization = await buildBackendAuthorization();
  if ("error" in authorization) return false;

  for (const baseUrl of getBackendBaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}/users/me/screens`, {
        headers: { "x-caoa-authorization": authorization.value },
        cache: "no-store",
      });
      if (!response.ok) return false;
      const body = await response.json() as { screens?: unknown };
      return Array.isArray(body.screens) && body.screens.includes(screenCode);
    } catch {
      // Try the next configured backend URL.
    }
  }

  return false;
}
