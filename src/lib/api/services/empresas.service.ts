import { db } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import { uploadToCloudinary } from '../../cloudinary-upload';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import {
  Empresa,
  CreateEmpresaDTO,
  UpdateEmpresaDTO,
  EmpresaVagasCount,
} from '../types';

/**
 * Empresas (Companies) API Service - Firestore Implementation
 */
export const empresasService = {
  /**
   * Create a new company (admin only)
   */
  async create(data: CreateEmpresaDTO): Promise<Empresa> {
    const docRef = await addDoc(collection(db, COLLECTIONS.EMPRESAS), {
      ...data,
      ativa: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Empresa;
  },

  /**
   * List all active companies (public)
   */
  async list(): Promise<Empresa[]> {
    const q = query(
      collection(db, COLLECTIONS.EMPRESAS),
      where('ativa', '==', true),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Empresa,
    );
  },

  /**
   * Get company by ID (public)
   */
  async getById(id: string): Promise<Empresa> {
    const docRef = doc(db, COLLECTIONS.EMPRESAS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Empresa not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Empresa;
  },

  /**
   * Update company (admin/recruiter)
   */
  async update(id: string, data: UpdateEmpresaDTO): Promise<Empresa> {
    const docRef = doc(db, COLLECTIONS.EMPRESAS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Empresa;
  },

  /**
   * Upload company logo
   */
  async uploadLogo(id: string, file: File): Promise<{ logoUrl: string }> {
    const { url } = await uploadToCloudinary(file, {
      folder: 'web-skill-first/logos',
    });

    const docRef = doc(db, COLLECTIONS.EMPRESAS, id);
    await updateDoc(docRef, { logoUrl: url });

    return { logoUrl: url };
  },

  /**
   * Deactivate company (admin only)
   */
  async deactivate(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.EMPRESAS, id);
    await updateDoc(docRef, { ativa: false });
  },

  /**
   * Activate company (admin only)
   */
  async activate(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.EMPRESAS, id);
    await updateDoc(docRef, { ativa: true });
  },

  /**
   * Get job count for company
   */
  async getVagasCount(id: string): Promise<EmpresaVagasCount> {
    // Total count
    const qTotal = query(
      collection(db, COLLECTIONS.VAGAS),
      where('empresaId', '==', id),
    );
    const snapTotal = await getCountFromServer(qTotal);

    // Active count
    const qActive = query(
      collection(db, COLLECTIONS.VAGAS),
      where('empresaId', '==', id),
      where('status', '==', 'aberta'),
    );
    const snapActive = await getCountFromServer(qActive);

    return {
      total: snapTotal.data().count,
      ativas: snapActive.data().count,
    };
  },
};
