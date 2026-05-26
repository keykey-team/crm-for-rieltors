import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
          const res = await fetch(`${apiBase}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-return-session-token': 'true',
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const user = await res.json();
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accountType: user.accountType,
            plan: user.plan,
            permissions: user.permissions,
            backendToken: user.backendToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType;
        token.plan = user.plan;
        token.permissions = user.permissions ?? null;
        token.backendToken = user.backendToken ?? null;
      }
      if (trigger === 'update' || trigger === 'signIn') return token;
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).accountType = token.accountType;
        (session.user as any).plan = token.plan;
        (session.user as any).permissions = token.permissions ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
