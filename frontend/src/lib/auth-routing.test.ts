import { describe, expect, it } from "vitest";
import { buildLoginRedirectHref, DEFAULT_POST_LOGIN_PATH, getSafeCallbackUrl } from "./auth-routing";

describe("auth routing", () => {
  it("preserva somente destinos internos seguros", () => {
    expect(getSafeCallbackUrl("/dashboard?period=mes")).toBe("/dashboard?period=mes");
    expect(getSafeCallbackUrl("https://app.example.com/perfil", "https://app.example.com")).toBe("/perfil");
  });

  it("bloqueia callback URLs externas, protocol-relative, vazias e inválidas", () => {
    expect(getSafeCallbackUrl("https://evil.example", "https://app.example.com")).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(getSafeCallbackUrl("//evil.example")).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(getSafeCallbackUrl(undefined)).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(getSafeCallbackUrl("not a url", "https://app.example.com")).toBe(DEFAULT_POST_LOGIN_PATH);
  });

  it("constrói o link de login com callback normalizado", () => {
    expect(buildLoginRedirectHref("https://evil.example")).toBe("/login?callbackUrl=%2Fsales-intention");
  });
});
