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
  async apply(vagaId: string, userId?: string): Promise<Candidatura> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario nao autenticado');

    // Check if already applied
    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('vagaId', '==', vagaId),
      where('candidatoId', '==', uid),
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error('Você já se candidatou para esta vaga');
    }

    // Fetch related data for denormalization (optional but good for UI)
    // For now we just store IDs

    const docRef = await addDoc(collection(db, COLLECTIONS.CANDIDATURAS), {
      vagaId,
      candidatoId: uid,
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
  async getMinhas(userId?: string): Promise<Candidatura[]> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario nao autenticado');

    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('candidatoId', '==', uid),
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Candidatura,
    );

    // Sort in memory
    const sortedDocs = docs.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return dateB - dateA;
    });

    // Fetch full vacancy details for each application to ensure we have location, company logo, etc.
    const enrichedDocs = await Promise.all(
      sortedDocs.map(async (app) => {
        try {
          const vagaDoc = await getDoc(doc(db, COLLECTIONS.VAGAS, app.vagaId));
          if (vagaDoc.exists()) {
            const vagaData = vagaDoc.data();
            return {
              ...app,
              vaga: {
                id: vagaDoc.id,
                titulo: vagaData.titulo,
                empresa: {
                  id: vagaData.empresaId,
                  nome: vagaData.empresaNome || vagaData.empresa?.nome,
                  logoUrl: vagaData.empresa?.logoUrl,
                },
                localizacao: vagaData.localizacao,
              },
            };
          }
          return app;
        } catch (error) {
          console.error(
            `Error fetching vacancy details for app ${app.id}:`,
            error,
          );
          return app;
        }
      }),
    );

    return enrichedDocs as Candidatura[];
  },

  /**
   * Get applications for a job (recruiter)
   */
  async getByVaga(vagaId: string): Promise<Candidatura[]> {
    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('vagaId', '==', vagaId),
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Candidatura,
    );

    return docs.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return dateB - dateA;
    });
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
    );

    // Fallback if index not ready: client side sort
    try {
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Candidatura,
      );

      // Sort by score
      return docs.sort(
        (a, b) => (b.pontuacaoFinal || 0) - (a.pontuacaoFinal || 0),
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
