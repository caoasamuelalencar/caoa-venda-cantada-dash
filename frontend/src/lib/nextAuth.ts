import NextAuth from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";
import type { NextAuthOptions } from "next-auth";

function getStringField(value: unknown, key: string) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const field = record[key];

  return typeof field === "string" ? field : undefined;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Azure AD (Microsoft Entra ID) - for production
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Se a URL é relativa, permitir
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Se a URL é do mesmo host, permitir
      else if (new URL(url).origin === baseUrl) return url;
      // Caso contrário, redirecionar para /relatorios
      return `${baseUrl}/relatorios`;
    },
    async signIn({ user, profile }) {
      const allowedDomain = "caoa.com.br";
      const userEmail = user?.email || getStringField(profile, "email") || "";
      if (!userEmail) return false;
      return userEmail.toLowerCase().endsWith(`@${allowedDomain}`);
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          name: session.user?.name || token.name || undefined,
          email: session.user?.email || token.email || undefined,
          image: session.user?.image || token.picture || undefined,
        };
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.name = token.name || user.name || undefined;
        token.email = token.email || user.email || undefined;
        token.picture = token.picture || user.image || getStringField(profile, "picture");
      }

      if (account?.provider === "azure-ad" && account.access_token) {
        try {
          const response = await fetch("https://graph.microsoft.com/v1.0/me/photos/48x48/$value", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type") ?? "image/jpeg";
            const buffer = Buffer.from(await response.arrayBuffer());
            token.picture = `data:${contentType};base64,${buffer.toString("base64")}`;
          }
        } catch {
          // Ignore photo fetch failures and keep the existing token picture.
        }
      }

      return token;
    },
  },
};

// Export handler factory used by route.ts
export default function NextAuthHandler() {
  return NextAuth(authOptions);
}
