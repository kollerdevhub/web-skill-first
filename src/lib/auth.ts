import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.AUTH_SECRET,
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
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and user info
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Check if user email is admin
        token.role =
          user.email === 'williamkoller30@gmail.com' ? 'admin' : 'candidate';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as string) || 'candidate';
      }
      return session;
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
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
