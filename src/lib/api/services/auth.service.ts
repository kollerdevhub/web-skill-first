import { signOutUser } from '../../firebase-auth';
import { db, auth } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthUser, RefreshTokenResponse } from '../types';

/**
 * Auth API Service - Firebase Implementation
 */
export const authService = {
  /**
   * Refresh access token - No-op in Firebase client SDK (handled automatically)
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      return { accessToken: token, expiresIn: 3600 };
    }
    throw new Error('No user logged in');
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await signOutUser();
  },

  /**
   * Register LGPD consent
   */
  async registerConsent(): Promise<{ success: boolean }> {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      await setDoc(
        userRef,
        { lgpdConsent: true, consentedAt: new Date().toISOString() },
        { merge: true },
      );
      return { success: true };
    }
    return { success: false };
  },

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<AuthUser> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    return {
      id: user.uid,
      email: user.email,
      role: user.email === 'williamkoller30@gmail.com' ? 'admin' : 'candidato', // Simple check for now
    };
  },
};
