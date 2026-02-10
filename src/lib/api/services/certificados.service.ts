import { db, auth } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { Certificado, ValidateCertificadoResponse } from '../types';

/**
 * Certificados (Certificates) API Service - Firestore Implementation
 */
export const certificadosService = {
  /**
   * Get my certificates (candidate)
   */
  async getMeus(): Promise<Certificado[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const q = query(
      collection(db, COLLECTIONS.CERTIFICADOS),
      where('candidatoId', '==', user.uid),
      orderBy('dataEmissao', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Certificado,
    );
  },

  /**
   * Validate certificate by code (public)
   */
  async validate(codigo: string): Promise<ValidateCertificadoResponse> {
    const q = query(
      collection(db, COLLECTIONS.CERTIFICADOS),
      where('codigo', '==', codigo),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { valido: false, mensagem: 'Certificado não encontrado' };
    }

    const certificado = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Certificado;

    return {
      valido: true,
      certificado,
    };
  },

  /**
   * Get certificate by ID
   */
  async getById(id: string): Promise<Certificado> {
    const docRef = doc(db, COLLECTIONS.CERTIFICADOS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Certificado not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Certificado;
  },
};
