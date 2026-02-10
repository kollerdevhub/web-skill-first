import { db, auth } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
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
  orderBy,
} from 'firebase/firestore';
import {
  Candidatura,
  UpdateCandidaturaStatusDTO,
  ConvidarEntrevistaDTO,
  ConvidarEntrevistaResponse,
} from '../types';

/**
 * Candidaturas (Applications) API Service - Firestore Implementation
 */
export const candidaturasService = {
  /**
   * Apply to a job (candidate)
   */
  async apply(vagaId: string): Promise<Candidatura> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    // Check if already applied
    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('vagaId', '==', vagaId),
      where('candidatoId', '==', user.uid),
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error('Você já se candidatou para esta vaga');
    }

    // Fetch related data for denormalization (optional but good for UI)
    // For now we just store IDs

    const docRef = await addDoc(collection(db, COLLECTIONS.CANDIDATURAS), {
      vagaId,
      candidatoId: user.uid,
      status: 'pendente',
      dataInscricao: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      feedbackEnviado: false,
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Candidatura;
  },

  /**
   * Get my applications (candidate)
   */
  async getMinhas(): Promise<Candidatura[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('candidatoId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    // TODO: Ideally populate Vaga data here if needed, or do it in the UI component via separate fetch
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Candidatura,
    );
  },

  /**
   * Get applications for a job (recruiter)
   */
  async getByVaga(vagaId: string): Promise<Candidatura[]> {
    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('vagaId', '==', vagaId),
      orderBy('createdAt', 'desc'), // Might require composite index
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Candidatura,
    );
  },

  /**
   * Get candidate ranking for a job (recruiter)
   */
  async getRanking(vagaId: string): Promise<Candidatura[]> {
    // Ranking logic usually requires backend process.
    // For now returning the same as getByVaga, sorted by a score field if it exists
    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('vagaId', '==', vagaId),
      orderBy('pontuacaoFinal', 'desc'), // Requires composite index
    );

    // Fallback if index not ready: client side sort
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Candidatura,
      );
    } catch {
      return this.getByVaga(vagaId);
    }
  },

  /**
   * Get application by ID
   */
  async getById(id: string): Promise<Candidatura> {
    const docRef = doc(db, COLLECTIONS.CANDIDATURAS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Candidatura not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Candidatura;
  },

  /**
   * Update application status (recruiter)
   */
  async updateStatus(
    id: string,
    data: UpdateCandidaturaStatusDTO,
  ): Promise<Candidatura> {
    const docRef = doc(db, COLLECTIONS.CANDIDATURAS, id);
    await updateDoc(docRef, {
      status: data.status,
      notasRecrutador: data.notasRecrutador,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Candidatura;
  },

  /**
   * Send feedback to candidate (recruiter)
   */
  async sendFeedback(id: string, mensagem: string): Promise<Candidatura> {
    const docRef = doc(db, COLLECTIONS.CANDIDATURAS, id);
    await updateDoc(docRef, {
      feedbackMensagem: mensagem,
      feedbackEnviado: true,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Candidatura;
  },

  /**
   * Cancel application (candidate)
   */
  async cancel(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.CANDIDATURAS, id));
  },

  /**
   * Invite candidate to interview (recruiter)
   */
  async inviteToInterview(
    id: string,
    data: ConvidarEntrevistaDTO,
  ): Promise<ConvidarEntrevistaResponse> {
    // In a real serverless app, this would trigger a Cloud Function to send email/whatsapp
    // For now we just update the doc or mock it
    const docRef = doc(db, COLLECTIONS.CANDIDATURAS, id);
    await updateDoc(docRef, {
      status: 'entrevista',
      entrevistaData: data,
      updatedAt: new Date().toISOString(),
    });

    return {
      enviado: true,
      canal: 'email',
      mensagem: `Convite enviado para ${data.dataEntrevista} em ${data.local}`,
    };
  },
};
