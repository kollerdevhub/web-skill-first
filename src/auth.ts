import NextAuth, { User } from 'next-auth';
import Google from 'next-auth/providers/google';
import { initAdmin } from '@/lib/firebase-admin';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
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
