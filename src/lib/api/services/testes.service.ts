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
} from 'firebase/firestore';
import {
  Teste,
  CreateTesteDTO,
  UpdateTesteDTO,
  SubmeterTesteDTO,
  SubmeterTesteResponse,
} from '../types';

/**
 * Testes (Assessments) API Service - Firestore Implementation
 */
export const testesService = {
  /**
   * Create test for a job (recruiter)
   */
  async create(data: CreateTesteDTO): Promise<Teste> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TESTES), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Teste;
  },

  /**
   * Get test by ID (recruiter - includes answers)
   */
  async getById(id: string): Promise<Teste> {
    const docRef = doc(db, COLLECTIONS.TESTES, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Test not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Teste;
  },

  /**
   * Get test by job ID (recruiter)
   */
  async getByVaga(vagaId: string): Promise<Teste | null> {
    const q = query(
      collection(db, COLLECTIONS.TESTES),
      where('vagaId', '==', vagaId),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Teste;
  },

  /**
   * Get test for candidate (no answers)
   */
  async getForCandidate(id: string): Promise<Teste> {
    const docRef = doc(db, COLLECTIONS.TESTES, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Test not found');
    }

    const data = snapshot.data() as Teste;

    // Strip correct answers
    const questionsWithoutAnswers = data.questoes.map((q) => {
      const { respostaCorreta, ...rest } = q;
      return rest;
    });

    return {
      ...data,
      id: snapshot.id,
      questoes: questionsWithoutAnswers,
    } as Teste;
  },

  /**
   * Update test (recruiter)
   */
  async update(id: string, data: UpdateTesteDTO): Promise<Teste> {
    const docRef = doc(db, COLLECTIONS.TESTES, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Teste;
  },

  /**
   * Delete test (recruiter)
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.TESTES, id));
  },

  /**
   * Submit test answers (candidate)
   */
  async submit(data: SubmeterTesteDTO): Promise<SubmeterTesteResponse> {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario nao autenticado');

    // Fetch full test to check answers
    const testRef = doc(db, COLLECTIONS.TESTES, data.testeId);
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) throw new Error('Test not found');

    const testData = testSnap.data() as Teste;

    let score = 0;
    const totalQuestions = testData.questoes.length;

    data.respostas.forEach((res) => {
      const question = testData.questoes[res.questaoIndex];
      if (question && question.respostaCorreta === res.resposta) {
        score++;
      }
    });

    const approved =
      totalQuestions > 0
        ? (score / totalQuestions) * 10 >= testData.notaMinima
        : true;

    // Update application with score if candidatureId provided
    if (data.candidaturaId) {
      const appRef = doc(db, COLLECTIONS.CANDIDATURAS, data.candidaturaId);
      await updateDoc(appRef, {
        pontuacaoTeste: score,
        status: approved ? 'aprovado_triagem' : 'reprovado', // Auto-move status logic?
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      nota: score,
      aprovado: approved,
      totalQuestoes: totalQuestions,
      totalAcertos: score,
    };
  },
};
