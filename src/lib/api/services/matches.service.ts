import { db } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { MatchResult } from '../types';

export const matchesService = {
  /**
   * Get match result by user ID and job ID
   */
  async getMatch(userId: string, jobId: string): Promise<MatchResult | null> {
    const matchId = `${userId}_${jobId}`;
    const docRef = doc(db, COLLECTIONS.MATCHES, matchId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as MatchResult;
  },

  /**
   * Subscribe to match result updates (real-time)
   */
  subscribeToMatch(
    userId: string,
    jobId: string,
    callback: (match: MatchResult | null) => void,
  ) {
    const matchId = `${userId}_${jobId}`;
    const docRef = doc(db, COLLECTIONS.MATCHES, matchId);

    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as MatchResult);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Save match result (usually called by backend/AI service, but here for completeness)
   */
  async saveMatch(match: MatchResult): Promise<void> {
    const matchId = `${match.uid}_${match.jobId}`;
    const docRef = doc(db, COLLECTIONS.MATCHES, matchId);
    await setDoc(docRef, match);
  },
};
