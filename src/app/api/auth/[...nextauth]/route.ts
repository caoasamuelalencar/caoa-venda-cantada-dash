import NextAuthHandler, { authOptions } from "../../../../lib/nextAuth";

const handler = NextAuthHandler();

export { handler as GET, handler as POST };
