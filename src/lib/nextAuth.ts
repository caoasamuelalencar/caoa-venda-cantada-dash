import NextAuth from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";
import { NextAuthOptions } from "next-auth";

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
    async signIn({ user, account, profile, email, credentials }) {
      const allowedDomain = "caoa.com.br";
      const userEmail = (user?.email || profile?.email || (email as any)?.value || "").toString();
      if (!userEmail) return false;
      return userEmail.toLowerCase().endsWith(`@${allowedDomain}`);
    },
    async session({ session, token }) {
      if (token) {
        const user = session.user ?? ({} as any);
        user.name = user.name || (token.name as string);
        user.email = user.email || (token.email as string);
        user.image = user.image || (token.picture as string);
        session.user = user;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.name = token.name || (user as any).name;
        token.email = token.email || (user as any).email;
        token.picture = token.picture || (user as any).image || (profile as any)?.picture;
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
        } catch (error) {
          console.error("Failed to load Azure AD profile photo:", error);
        }
      }

      return token;
    },
  },
};

// Export handler factory used by route.ts
export default function NextAuthHandler() {
  return NextAuth(authOptions as any);
}
