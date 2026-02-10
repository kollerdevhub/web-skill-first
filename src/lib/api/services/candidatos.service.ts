import { db, auth } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import { uploadToCloudinary } from '../../cloudinary-upload';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { Candidato, CreateCandidatoDTO, UpdateCandidatoDTO } from '../types';

/**
 * Candidatos (Candidates) API Service - Firestore Implementation
 */
export const candidatosService = {
  /**
   * Get my profile (logged in candidate)
   */
  async getMyProfile(): Promise<Candidato> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const docRef = doc(db, COLLECTIONS.CANDIDATOS, user.uid);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      // Or return null, depending on how UI handles it. The original service threw 404 likely.
      throw new Error('Perfil de candidato não encontrado');
    }

    return { id: snapshot.id, ...snapshot.data() } as Candidato;
  },

  /**
   * Create my profile
   */
  async createProfile(data: CreateCandidatoDTO): Promise<Candidato> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const docRef = doc(db, COLLECTIONS.CANDIDATOS, user.uid);
    const candidatoData = {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, candidatoData);

    return { id: user.uid, ...candidatoData } as Candidato;
  },

  /**
   * Update my profile
   */
  async updateProfile(data: UpdateCandidatoDTO): Promise<Candidato> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const docRef = doc(db, COLLECTIONS.CANDIDATOS, user.uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Candidato;
  },

  /**
   * Upload curriculum PDF (max 5MB)
   */
  async uploadCurriculo(file: File): Promise<{ curriculoUrl: string }> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const { url } = await uploadToCloudinary(file, {
      folder: 'web-skill-first/curriculos',
      resourceType: 'raw', // PDF implies raw or maybe auto
    });

    const docRef = doc(db, COLLECTIONS.CANDIDATOS, user.uid);
    await updateDoc(docRef, { curriculoUrl: url });

    return { curriculoUrl: url };
  },

  /**
   * Delete curriculum
   */
  async deleteCurriculo(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const docRef = doc(db, COLLECTIONS.CANDIDATOS, user.uid);
    await updateDoc(docRef, { curriculoUrl: null });
  },

  /**
   * Get candidate by ID (recruiter/admin only)
   */
  async getById(id: string): Promise<Candidato> {
    const docRef = doc(db, COLLECTIONS.CANDIDATOS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Candidato not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Candidato;
  },
};
