import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { initAdmin } from '@/lib/firebase-admin';

const authSecret = process.env.AUTH_SECRET
const googleClientId =
  process.env.AUTH_GOOGLE_ID
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET

if (!googleClientId || !googleClientSecret) {
  console.error(
    '[auth] Missing Google OAuth env vars. Configure AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET).',
  );
}

if (!authSecret && process.env.NODE_ENV === 'production') {
  console.error(
    '[auth] Missing secret. Configure AUTH_SECRET (or NEXTAUTH_SECRET) in production.',
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
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
            // Get or create user can be done here implicitly by createCustomToken
            // Using user.id from NextAuth (which corresponds to Google ID) as uid
            // OR use email to find/create user in Firebase Auth.
            // Using email as uid is NOT recommended but common in simple bridges.
            // Better: use Google ID as uid.
            // even better: user.id from NextAuth IS the Google ID (sub).
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
      // Add custom token to session so client can use it
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
