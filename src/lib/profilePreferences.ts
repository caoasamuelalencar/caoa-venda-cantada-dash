type ProfilePreferences = {
  displayName?: string;
  imageUrl?: string;
};

const STORAGE_PREFIX = "caoa-profile-preferences:";
export const PROFILE_PREFERENCES_UPDATED_EVENT = "caoa-profile-preferences-updated";

export function getProfilePreferencesKey(identifier?: string | null) {
  const safeIdentifier = identifier?.trim().toLowerCase() || "default";
  return `${STORAGE_PREFIX}${safeIdentifier}`;
}

export function readProfilePreferences(identifier?: string | null): ProfilePreferences {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(getProfilePreferencesKey(identifier));
    if (!stored) return {};
    const parsed = JSON.parse(stored) as ProfilePreferences;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProfilePreferences(identifier: string | null | undefined, preferences: ProfilePreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getProfilePreferencesKey(identifier), JSON.stringify(preferences));
  window.dispatchEvent(new Event(PROFILE_PREFERENCES_UPDATED_EVENT));
}

export function clearProfilePreferences(identifier: string | null | undefined) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getProfilePreferencesKey(identifier));
  window.dispatchEvent(new Event(PROFILE_PREFERENCES_UPDATED_EVENT));
}
