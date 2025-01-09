import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      /** Google ID token, can use to authenticate into Firebase with credentials. */
      id_token: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
        token.id_token = account.id_token;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.id_token = token.id_token as string;
      return session;
    },
  },
});
