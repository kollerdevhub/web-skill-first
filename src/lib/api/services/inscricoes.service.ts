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
  increment,
  writeBatch,
} from 'firebase/firestore';
import {
  Inscricao,
  UpdateProgressoDTO,
  SubmitQuizDTO,
  SubmitQuizResponse,
} from '../types';

/**
 * Inscricoes (Course Enrollments) API Service - Firestore Implementation
 */
export const inscricoesService = {
  /**
   * Enroll in a course (candidate)
   */
  async enroll(cursoId: string): Promise<Inscricao> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    // Check existing enrollment
    const q = query(
      collection(db, COLLECTIONS.INSCRICOES),
      where('cursoId', '==', cursoId),
      where('candidatoId', '==', user.uid),
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return {
        id: existing.docs[0].id,
        ...existing.docs[0].data(),
      } as Inscricao;
    }

    const batch = writeBatch(db);
    const newEnrollmentRef = doc(collection(db, COLLECTIONS.INSCRICOES));

    const enrollmentData = {
      candidatoId: user.uid,
      cursoId,
      status: 'em_andamento',
      progress: 0,
      progressoPercentual: 0,
      dataInscricao: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      certificadoEmitido: false,
      modulosProgresso: [],
    };

    batch.set(newEnrollmentRef, enrollmentData);

    // Update course totalInscritos
    const courseRef = doc(db, COLLECTIONS.CURSOS, cursoId);
    batch.update(courseRef, { totalInscritos: increment(1) });

    await batch.commit();

    return { id: newEnrollmentRef.id, ...enrollmentData } as Inscricao;
  },

  /**
   * Get my enrollments (candidate)
   */
  async getMinhas(): Promise<Inscricao[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    const q = query(
      collection(db, COLLECTIONS.INSCRICOES),
      where('candidatoId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Inscricao,
    );
  },

  /**
   * Get enrollment by ID
   */
  async getById(id: string): Promise<Inscricao> {
    const docRef = doc(db, COLLECTIONS.INSCRICOES, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Enrollment not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Inscricao;
  },

  /**
   * Update progress (candidate)
   */
  async updateProgress(
    id: string,
    data: UpdateProgressoDTO,
  ): Promise<Inscricao> {
    const docRef = doc(db, COLLECTIONS.INSCRICOES, id);

    // Fetch current state to update array
    const snapshot = await getDoc(docRef);
    const current = snapshot.data() as Inscricao;

    const modulosProgresso = current.modulosProgresso || [];
    const index = modulosProgresso.findIndex(
      (m) => m.moduloId === data.moduloId,
    );

    if (index >= 0) {
      modulosProgresso[index] = {
        ...modulosProgresso[index],
        concluido: data.concluido,
        tempoAssistido:
          data.tempoAssistido || modulosProgresso[index].tempoAssistido,
      };
    } else {
      modulosProgresso.push({
        moduloId: data.moduloId,
        concluido: data.concluido,
        tempoAssistido: data.tempoAssistido,
      });
    }

    // Recalculate percentual (assuming we know total modules from course or pass it)
    // For simplicity, we just save the array. UI/Calc logic handles the rest.

    await updateDoc(docRef, {
      modulosProgresso,
      updatedAt: new Date().toISOString(),
      lastAccessedModule: data.moduloId,
      ultimoAcesso: new Date().toISOString(),
    });

    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Inscricao;
  },

  /**
   * Submit quiz answers (candidate)
   */
  async submitQuiz(
    id: string,
    data: SubmitQuizDTO,
  ): Promise<SubmitQuizResponse> {
    // In backend-less, validation must happen here (fetching correct answers)
    // OR answers are checked client-side (less secure) or via Cloud Function
    // For prototype: check answers if stored in module doc

    // 1. Fetch Module to get correct answers
    const moduleId = data.moduloId;
    const moduleRef = doc(db, COLLECTIONS.MODULOS, moduleId); // Assuming modules collection
    const moduleSnap = await getDoc(moduleRef);
    const moduleData = moduleSnap.data();

    let score = 0;
    const totalQuestions = moduleData?.questoesQuiz?.length || 0;

    if (moduleData && moduleData.questoesQuiz) {
      data.respostas.forEach((res) => {
        const question = moduleData.questoesQuiz[res.questaoIndex];
        if (question && question.respostaCorreta === res.resposta) {
          score++;
        }
      });
    }

    const approved = totalQuestions > 0 ? score / totalQuestions >= 0.7 : true;

    // Update enrollment with quiz result
    // ... logic to update modulosProgresso with quiz score ...

    return {
      nota: score,
      aprovado: approved,
      totalQuestoes: totalQuestions,
      totalAcertos: score,
    };
  },

  /**
   * Cancel enrollment (candidate)
   */
  async cancel(id: string): Promise<void> {
    const snapshot = await getDoc(doc(db, COLLECTIONS.INSCRICOES, id));
    if (snapshot.exists()) {
      const data = snapshot.data() as Inscricao;

      const batch = writeBatch(db);
      batch.delete(doc(db, COLLECTIONS.INSCRICOES, id));

      // Decrement course count
      const courseRef = doc(db, COLLECTIONS.CURSOS, data.cursoId);
      batch.update(courseRef, { totalInscritos: increment(-1) });

      await batch.commit();
    }
  },
};
