import { db } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { AuthUser } from '../types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: string;
  enrollments?: number;
  applications?: number;
  certificates?: number;
}

export const usersService = {
  /**
   * List all users (admin only)
   */
  async list(): Promise<AdminUser[]> {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.displayName || data.name || 'Sem nome',
        email: data.email,
        image: data.photoURL || data.image,
        role: data.role || 'candidate',
        createdAt: data.createdAt || new Date().toISOString(),
        enrollments: data.enrollmentsCount || 0,
        applications: data.applicationsCount || 0,
        certificates: data.certificatesCount || 0,
      } as AdminUser;
    });
  },

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, { role });
  },

  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<AdminUser> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('User not found');
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.displayName || data.name,
      email: data.email,
      image: data.photoURL || data.image,
      role: data.role || 'candidate',
      createdAt: data.createdAt,
      enrollments: data.enrollmentsCount || 0,
      applications: data.applicationsCount || 0,
      certificates: data.certificatesCount || 0,
    } as AdminUser;
  },
};
