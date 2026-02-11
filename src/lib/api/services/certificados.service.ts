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
  addDoc,
} from 'firebase/firestore';
import {
  Certificado,
  ValidateCertificadoResponse,
  CreateCursoDTO,
} from '../types';

interface CreateCertificadoDTO {
  cursoId: string;
  cursoTitulo: string;
  cursoCargaHoraria: number;
  cursoCategoria: string;
  cursoNivel: string;
  candidatoId: string;
  candidatoNome: string;
  notaFinal?: number;
}

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
    );

    const snapshot = await getDocs(q);
    const certificates = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Certificado,
    );

    // Sort in memory to avoid composite index requirement
    return certificates.sort(
      (a, b) =>
        new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime(),
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

  /**
   * Create a new certificate
   */
  async generateCertificate(data: CreateCertificadoDTO): Promise<Certificado> {
    console.log('Generating certificate with data:', data);
    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newCertificate: Omit<Certificado, 'id'> = {
      codigo,
      candidatoId: data.candidatoId,
      cursoId: data.cursoId,
      curso: {
        id: data.cursoId,
        titulo: data.cursoTitulo,
        categoria: data.cursoCategoria as any,
        nivel: data.cursoNivel as any,
      },
      candidato: {
        id: data.candidatoId,
        nome: data.candidatoNome,
      },
      dataEmissao: new Date().toISOString(),
      cargaHoraria: data.cursoCargaHoraria,
      notaFinal: data.notaFinal,
      ativo: true,
      createdAt: new Date().toISOString(),
      // In a real app, generate PDF here or via Cloud Function
      pdfUrl: undefined,
      validationUrl: `${window.location.origin}/dashboard/certificados/validar/${codigo}`,
    };

    const cleanData = Object.fromEntries(
      Object.entries(newCertificate).filter(([_, v]) => v !== undefined),
    );

    const docRef = await addDoc(
      collection(db, COLLECTIONS.CERTIFICADOS),
      cleanData,
    );
    return { id: docRef.id, ...newCertificate } as Certificado;
  },
};
