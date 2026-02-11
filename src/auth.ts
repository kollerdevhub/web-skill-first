import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { initAdmin } from '@/lib/firebase-admin';

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
const googleClientId =
  process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

const isProd = process.env.NODE_ENV === 'production';
const oauthCookiePrefix = isProd ? '__Secure-authjs' : 'authjs';

if (!googleClientId || !googleClientSecret) {
  console.error(
    '[auth] Missing Google OAuth env vars. Configure AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET).',
  );
}

if (!authSecret && isProd) {
  console.error(
    '[auth] Missing secret. Configure AUTH_SECRET (or NEXTAUTH_SECRET) in production.',
  );
}

if (
  process.env.AUTH_SECRET &&
  process.env.NEXTAUTH_SECRET &&
  process.env.AUTH_SECRET !== process.env.NEXTAUTH_SECRET
) {
  console.warn(
    '[auth] AUTH_SECRET and NEXTAUTH_SECRET differ. Keep only one secret value to avoid auth inconsistencies.',
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  cookies: {
    // Version OAuth cookies so old/corrupted cookies from previous deploys are ignored.
    pkceCodeVerifier: {
      name: `${oauthCookiePrefix}.pkce.code_verifier.v2`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        maxAge: 60 * 15,
      },
    },
    state: {
      name: `${oauthCookiePrefix}.state.v2`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        maxAge: 60 * 15,
      },
    },
    nonce: {
      name: `${oauthCookiePrefix}.nonce.v2`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Mint custom token using firebase-admin
        try {
          const app = await initAdmin();
          if (app && user.email) {
            const customToken = await app
              .auth()
              .createCustomToken(user.id || user.email || 'unknown', {
                email: user.email,
                name: user.name,
                picture: user.image,
              });
            token.firebaseToken = customToken;
          }
        } catch (error) {
          console.error('Error minting custom token:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.firebaseToken) {
        session.firebaseToken = token.firebaseToken as string;
      }
      return session;
    },
  },
});

declare module 'next-auth' {
  interface Session {
    firebaseToken?: string;
  }
}
