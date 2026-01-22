import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Buscar role do usuário para decidir redirecionamento
      if (user?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        // Armazenar role no user para uso no redirect callback
        (user as { role?: string }).role = dbUser?.role ?? 'candidate';
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Se é a URL raiz ou home, permitir
      if (url === baseUrl || url === `${baseUrl}/`) {
        return url;
      }
      // Se a URL já é válida dentro do app, usar
      if (url.startsWith(baseUrl)) {
        // Só redirecionar para /auth/redirect em callbacks de login
        if (url.includes('/api/auth/callback')) {
          return `${baseUrl}/auth/redirect`;
        }
        return url;
      }
      // Para qualquer outro caso (signIn sem callback), ir para redirect
      return `${baseUrl}/auth/redirect`;
    },
    async session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;

        // Buscar role diretamente do banco
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        session.user.role = dbUser?.role ?? 'candidate';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
