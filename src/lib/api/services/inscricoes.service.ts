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
import { certificadosService } from './certificados.service';
import { candidatosService } from './candidatos.service';

/**
 * Inscricoes (Course Enrollments) API Service - Firestore Implementation
 */
export const inscricoesService = {
  /**
   * Enroll in a course (candidate)
   */
  async enroll(cursoId: string, userId?: string): Promise<Inscricao> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario nao autenticado');

    // Check existing enrollment
    const q = query(
      collection(db, COLLECTIONS.INSCRICOES),
      where('cursoId', '==', cursoId),
      where('candidatoId', '==', uid),
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
      candidatoId: uid,
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
  async getMinhas(userId?: string): Promise<Inscricao[]> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario nao autenticado');

    const q = query(
      collection(db, COLLECTIONS.INSCRICOES),
      where('candidatoId', '==', uid),
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Inscricao,
    );

    // Fetch course details for each enrollment
    const docsWithCourses = await Promise.all(
      docs.map(async (inscricao) => {
        try {
          const courseDocRef = doc(db, COLLECTIONS.CURSOS, inscricao.cursoId);
          const courseSnap = await getDoc(courseDocRef);
          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            inscricao.curso = {
              id: courseSnap.id,
              titulo: courseData.titulo,
              thumbnailUrl: courseData.thumbnailUrl,
              totalModulos: courseData.totalModulos,
              categoria: courseData.categoria,
              cargaHoraria: courseData.cargaHoraria,
            };
          }
        } catch (error) {
          console.error('Error fetching course for enrollment:', error);
        }
        return inscricao;
      }),
    );

    // Sort in memory to avoid composite index requirement
    return docsWithCourses.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
   * Automatically calculates progressoPercentual and marks as complete
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
          data.tempoAssistido ?? modulosProgresso[index].tempoAssistido ?? 0,
      };
    } else {
      modulosProgresso.push({
        moduloId: data.moduloId,
        concluido: data.concluido,
        tempoAssistido: data.tempoAssistido ?? 0,
      });
    }

    // Fetch total modules from the course to calculate percentual
    const modulosQuery = query(
      collection(db, COLLECTIONS.MODULOS),
      where('cursoId', '==', current.cursoId),
    );
    const modulosSnapshot = await getDocs(modulosQuery);
    const totalModulos = modulosSnapshot.size;

    // Calculate progress percentage
    const completedCount = modulosProgresso.filter((m) => m.concluido).length;
    const progressoPercentual =
      totalModulos > 0 ? Math.round((completedCount / totalModulos) * 100) : 0;

    // Check if all modules are completed
    const isCompleted = totalModulos > 0 && completedCount >= totalModulos;

    const updateData: Record<string, unknown> = {
      modulosProgresso,
      progressoPercentual,
      progress: progressoPercentual,
      updatedAt: new Date().toISOString(),
      lastAccessedModule: data.moduloId,
      ultimoModuloAcessado: data.moduloId,
      ultimoAcesso: new Date().toISOString(),
    };

    // Auto-complete enrollment OR generate missing certificate
    if (
      isCompleted &&
      (current.status !== 'concluido' || !current.certificadoEmitido)
    ) {
      if (current.status !== 'concluido') {
        updateData.status = 'concluido';
        updateData.dataConclusao = new Date().toISOString();
      }

      // Generate Certificate & Update Resume
      try {
        const courseRef = doc(db, COLLECTIONS.CURSOS, current.cursoId);
        const courseSnap = await getDoc(courseRef);

        let candidateName = 'Aluno';
        try {
          const candidateData = await candidatosService.getById(
            current.candidatoId,
          );
          if (candidateData) candidateName = candidateData.nome;
        } catch (e) {
          console.warn('Could not fetch candidate profile for certificate', e);
        }

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();

          // 1. Generate Certificate
          await certificadosService.generateCertificate({
            cursoId: current.cursoId,
            cursoTitulo: courseData.titulo,
            cursoCargaHoraria: courseData.cargaHoraria,
            cursoCategoria: courseData.categoria,
            cursoNivel: courseData.nivel,
            candidatoId: current.candidatoId,
            candidatoNome: candidateName,
            notaFinal: current.notaAvaliacaoFinal, // If available
          });
          updateData.certificadoEmitido = true;

          // 2. Update Resume with Completed Course
          // Dynamic import to avoid circular dependency if resumesService imports inscricoesService (it doesn't, but good practice)
          const { resumesService } = await import('./resumes.service');
          await resumesService.addCompletedCourse(current.candidatoId, {
            nome: courseData.titulo,
            instituicao: 'SkillFirst', // Platform Name
            cargaHoraria: courseData.cargaHoraria,
            dataConclusao: new Date().toISOString(),
          });

          // Force update to ensure the flag is saved even if status was already concluded
          if (current.status === 'concluido') {
            await updateDoc(docRef, { certificadoEmitido: true });
          }
        }
      } catch (error) {
        console.error('Error generating certificate/resume:', error);
        // Don't fail the progress update if certificate generation fails
      }
    }

    await updateDoc(docRef, updateData);

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
