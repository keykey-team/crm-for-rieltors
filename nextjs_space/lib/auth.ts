import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

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
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role, accountType: user.accountType, plan: user.plan, permissions: user.permissions };
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
      }
      // refresh permissions from DB on every sign-in / session update
      if (trigger === 'update' || trigger === 'signIn') {
        try {
          const fresh = await prisma.user.findUnique({ where: { id: token.id as string }, select: { permissions: true, role: true } });
          if (fresh) {
            token.permissions = fresh.permissions ?? null;
            token.role = fresh.role;
          }
        } catch {}
      }
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
