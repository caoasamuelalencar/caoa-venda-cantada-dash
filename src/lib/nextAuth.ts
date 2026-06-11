import NextAuth from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    // Azure AD (Microsoft Entra ID) - for production
    ...(process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
      ? [
          AzureAD({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
          }),
        ]
      : []),

    // Development/Testing credentials provider
    // Remove or disable this in production
    CredentialsProvider({
      name: "Development Test",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Simple development test: any email ending with @caoa.com.br with password "test"
        if (
          credentials?.email?.endsWith("@caoa.com.br") &&
          credentials?.password === "test"
        ) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split("@")[0],
          };
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const allowedDomain = "caoa.com.br";
      const userEmail = (user?.email || profile?.email || email?.value || "").toString();
      if (!userEmail) return false;
      return userEmail.toLowerCase().endsWith(`@${allowedDomain}`);
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user || ({} as any);
        session.user.name = session.user.name || (token.name as string);
        session.user.email = session.user.email || (token.email as string);
        session.user.image = session.user.image || (token.picture as string);
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.name = token.name || (user as any).name;
        token.email = token.email || (user as any).email;
        token.picture = token.picture || (user as any).image;
      }
      return token;
    },
  },
};

// Export handler factory used by route.ts
export default function NextAuthHandler() {
  return NextAuth(authOptions as any);
}
