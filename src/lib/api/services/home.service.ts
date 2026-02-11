import { db } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  getCountFromServer,
} from 'firebase/firestore';
import { HomeData, VagaDestaque, CursoPopular } from '../types';

/**
 * Home (Landing Page) API Service - Firestore Implementation
 */
export const homeService = {
  /**
   * Get aggregated landing page data (public)
   */
  async getData(): Promise<HomeData> {
    // Run queries independently to prevent one failure (e.g., missing index) from breaking everything
    try {
      const [
        vagasSnapshotResult,
        cursosSnapshotResult,
        vagasCountResult,
        cursosCountResult,
        candidatosCountResult,
      ] = await Promise.allSettled([
        // Vagas Destaque (Simplified to avoid composite index)
        // Fetch recent jobs and filter in memory if needed
        getDocs(
          query(
            collection(db, COLLECTIONS.VAGAS),
            orderBy('createdAt', 'desc'),
            limit(20), // Fetch more to filter client-side
          ),
        ),

        // Cursos Populares (requires index: totalInscritos)
        getDocs(
          query(
            collection(db, COLLECTIONS.CURSOS),
            orderBy('totalInscritos', 'desc'),
            limit(4),
          ),
        ),

        // Stats
        getCountFromServer(collection(db, COLLECTIONS.VAGAS)),
        getCountFromServer(collection(db, COLLECTIONS.CURSOS)),
        getCountFromServer(collection(db, COLLECTIONS.CANDIDATOS)),
      ]);

      const vagasDestaque: VagaDestaque[] =
        vagasSnapshotResult.status === 'fulfilled'
          ? vagasSnapshotResult.value.docs
              .map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  titulo: data.titulo,
                  empresa: data.empresa || { nome: 'Empresa', logoUrl: '' },
                  localizacao: data.localizacao,
                  modalidade: data.modalidade,
                  tipoContrato: data.tipoContrato,
                  status: data.status, // We need status for filtering
                } as VagaDestaque & { status?: string };
              })
              .filter((v) => v.status === 'aberta')
              .slice(0, 4) // Limit to 4 after filtering
          : [];

      if (vagasSnapshotResult.status === 'rejected') {
        console.warn(
          'Failed to fetch Featured Jobs (check indexes):',
          vagasSnapshotResult.reason,
        );
      }

      const cursosPopulares: CursoPopular[] =
        cursosSnapshotResult.status === 'fulfilled'
          ? cursosSnapshotResult.value.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                titulo: data.titulo,
                categoria: data.categoria,
                nivel: data.nivel,
                thumbnailUrl: data.thumbnailUrl,
                totalInscritos: data.totalInscritos || 0,
              } as CursoPopular;
            })
          : [];

      if (cursosSnapshotResult.status === 'rejected') {
        console.warn(
          'Failed to fetch Popular Courses (check indexes):',
          cursosSnapshotResult.reason,
        );
      }

      return {
        vagasDestaque,
        cursosPopulares,
        estatisticas: {
          totalVagas:
            vagasCountResult.status === 'fulfilled'
              ? vagasCountResult.value.data().count
              : 0,
          totalCursos:
            cursosCountResult.status === 'fulfilled'
              ? cursosCountResult.value.data().count
              : 0,
          totalCandidatos:
            candidatosCountResult.status === 'fulfilled'
              ? candidatosCountResult.value.data().count
              : 0,
        },
      };
    } catch (error) {
      console.error('Error fetching home data:', error);
      // Return empty structure on catastrophic failure
      return {
        vagasDestaque: [],
        cursosPopulares: [],
        estatisticas: { totalVagas: 0, totalCursos: 0, totalCandidatos: 0 },
      };
    }
  },
};
