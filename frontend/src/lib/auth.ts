type StoredUser = {
  username: string;
  email: string;
  displayName: string;
  passwordHash: string;
};

const STORAGE_KEY = "caoa-auth-users";
const RESET_TOKEN_KEY = "caoa-auth-reset-tokens";

const DEFAULT_USERS: StoredUser[] = [
  {
    username: "CAOA",
    email: "admin@caoa.com",
    displayName: "CAOA",
    passwordHash: "CAOA", // mock user senha padrão; usa fallback se necessário
  },
];

const isBrowser = typeof window !== "undefined";

function readUsers(): StoredUser[] {
  if (!isBrowser) {
    return DEFAULT_USERS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_USERS;
    }

    const parsed = JSON.parse(stored) as StoredUser[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users: StoredUser[]) {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function readResetTokens(): Record<string, { username: string; expiresAt: number }> {
  if (!isBrowser) {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(RESET_TOKEN_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as Record<string, { username: string; expiresAt: number }>;
  } catch {
    return {};
  }
}

function saveResetTokens(tokens: Record<string, { username: string; expiresAt: number }>) {
  if (!isBrowser) return;
  window.localStorage.setItem(RESET_TOKEN_KEY, JSON.stringify(tokens));
}

async function hashPassword(password: string) {
  if (!isBrowser || !window.crypto?.subtle) {
    return password;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function findUser(username: string) {
  const users = readUsers();
  return users.find(
    (user) => user.username.toLowerCase() === username.trim().toLowerCase(),
  );
}

export async function validateCredentials(username: string, password: string) {
  const user = findUser(username);
  if (!user) {
    return null;
  }

  if (user.passwordHash === password) {
    return user;
  }

  const passwordHash = await hashPassword(password);
  return passwordHash === user.passwordHash ? user : null;
}

export async function registerUser(username: string, email: string, password: string) {
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedUsername || !normalizedEmail || !password) {
    return { success: false, message: "Preencha todos os campos." };
  }

  if (findUser(normalizedUsername)) {
    return { success: false, message: "Nome de usuário já existe." };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "A senha deve ter pelo menos 6 caracteres.",
    };
  }

  const users = readUsers();
  const passwordHash = await hashPassword(password);
  users.push({
    username: normalizedUsername,
    email: normalizedEmail,
    displayName: normalizedUsername,
    passwordHash,
  });
  saveUsers(users);

  return { success: true };
}

export function createPasswordResetToken(username: string) {
  const user = findUser(username);
  if (!user) {
    return null;
  }

  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${username}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const tokens = readResetTokens();
  tokens[token] = {
    username: user.username,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2,
  };
  saveResetTokens(tokens);

  return token;
}

export function verifyPasswordResetToken(token: string) {
  const tokens = readResetTokens();
  const entry = tokens[token];

  if (!entry || entry.expiresAt < Date.now()) {
    return null;
  }

  return entry.username;
}

export function consumePasswordResetToken(token: string) {
  const tokens = readResetTokens();
  delete tokens[token];
  saveResetTokens(tokens);
}

export async function updatePassword(username: string, password: string) {
  const users = readUsers();
  const userIndex = users.findIndex(
    (user) => user.username.toLowerCase() === username.trim().toLowerCase(),
  );

  if (userIndex === -1) {
    return false;
  }

  users[userIndex].passwordHash = await hashPassword(password);
  saveUsers(users);
  return true;
}

export function getAuthCookieValue() {
  if (!isBrowser) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("caoa-auth="));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] || "");
}
