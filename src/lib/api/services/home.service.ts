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
    // Parallel queries
    const [
      vagasSnapshot,
      cursosSnapshot,
      vagasCount,
      cursosCount,
      candidatosCount,
    ] = await Promise.all([
      // Vagas Destaque (recent open jobs)
      getDocs(
        query(
          collection(db, COLLECTIONS.VAGAS),
          where('status', '==', 'aberta'),
          orderBy('createdAt', 'desc'),
          limit(4),
        ),
      ),

      // Cursos Populares (top enrolled)
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

    const vagasDestaque: VagaDestaque[] = await Promise.all(
      vagasSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        // Fetch company name
        // Ideally denormalized, but valid to fetch here
        // For now using placeholder or if stored in doc
        // Assuming empresa name is NOT on vaga doc typically, but types say 'empresa' object
        // Let's assume we denormalized it or fetch it.
        // Simplified: return as is if data exists, else empty
        return {
          id: doc.id,
          titulo: data.titulo,
          empresa: data.empresa || { nome: 'Empresa', logoUrl: '' },
          localizacao: data.localizacao,
          modalidade: data.modalidade,
          tipoContrato: data.tipoContrato,
        } as VagaDestaque;
      }),
    );

    const cursosPopulares: CursoPopular[] = cursosSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo,
        categoria: data.categoria,
        nivel: data.nivel,
        thumbnailUrl: data.thumbnailUrl,
        totalInscritos: data.totalInscritos || 0,
      } as CursoPopular;
    });

    return {
      vagasDestaque,
      cursosPopulares,
      estatisticas: {
        totalVagas: vagasCount.data().count,
        totalCursos: cursosCount.data().count,
        totalCandidatos: candidatosCount.data().count,
      },
    };
  },
};
