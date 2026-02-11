import { db, auth } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Resume, CursoConcluido } from '../types';

export const resumesService = {
  /**
   * Get resume by user ID
   */
  async getResume(userId: string): Promise<Resume | null> {
    const docRef = doc(db, COLLECTIONS.RESUMES, userId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Resume;
  },

  /**
   * Create or update resume
   */
  async saveResume(userId: string, data: Partial<Resume>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RESUMES, userId);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  },

  /**
   * Add completed course to resume
   */
  async addCompletedCourse(
    userId: string,
    course: CursoConcluido,
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RESUMES, userId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      // Create initial resume if it doesn't exist
      await setDoc(docRef, {
        id: userId,
        cursosConcluidos: [course],
        updatedAt: new Date().toISOString(),
        hardSkills: [],
        softSkills: [],
        experiencias: [],
        formacao: [],
        keywords: [],
      });
    } else {
      const currentResume = snapshot.data() as Resume;
      const cursos = currentResume.cursosConcluidos || [];

      // Avoid duplicates
      if (
        !cursos.some(
          (c) => c.nome === course.nome && c.instituicao === course.instituicao,
        )
      ) {
        await updateDoc(docRef, {
          cursosConcluidos: [...cursos, course],
          updatedAt: new Date().toISOString(),
        });
      }
    }
  },
};
