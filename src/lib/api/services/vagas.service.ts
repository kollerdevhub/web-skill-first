import { db } from '../../firebase';
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
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import {
  Vaga,
  CreateVagaDTO,
  UpdateVagaDTO,
  VagaSearchParams,
  VagaCandidaturasCount,
  Candidatura,
  PaginatedResponse,
  Empresa,
} from '../types';

/**
 * Vagas (Jobs) API Service - Firestore Implementation
 */
export const vagasService = {
  /**
   * Create a new job (recruiter)
   */
  async create(data: CreateVagaDTO): Promise<Vaga> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    const docRef = await addDoc(collection(db, COLLECTIONS.VAGAS), {
      ...cleanData,
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Vaga;
  },

  /**
   * Search/list jobs (public)
   */
  async search(
    params: VagaSearchParams = {},
  ): Promise<PaginatedResponse<Vaga>> {
    let q = query(collection(db, COLLECTIONS.VAGAS));

    if (params.status) {
      q = query(q, where('status', '==', params.status));
    }

    // Additional filters like localizacao, tipoContrato etc would be added here
    // Combining many equality filters works in Firestore
    // Range filters (salarioMin) combined with other filters might require composite indexes

    if (params.localizacao) {
      q = query(q, where('localizacao', '==', params.localizacao));
    }

    if (params.tipoContrato) {
      q = query(q, where('tipoContrato', '==', params.tipoContrato));
    }

    if (params.modalidade) {
      q = query(q, where('modalidade', '==', params.modalidade));
    }

    // q = query(q, orderBy('createdAt', 'desc')); // Removed to avoid index issue

    const snapshot = await getDocs(q);
    let allData = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Vaga,
    );

    // Fetch company details for all jobs
    const empresaIds = [
      ...new Set(allData.map((v) => v.empresaId).filter(Boolean)),
    ];

    const empresaMap: Record<string, { nome: string; logoUrl?: string }> = {};

    if (empresaIds.length > 0) {
      // Optimization: Create a map of promises
      const empresaPromises = empresaIds.map(async (id) => {
        try {
          if (!id) return null;
          const empDoc = await getDoc(doc(db, COLLECTIONS.EMPRESAS, id));
          if (empDoc.exists()) {
            return { id, data: empDoc.data() as Empresa };
          }
        } catch (e) {
          console.error(`Error loading company ${id}`, e);
        }
        return null;
      });

      const empresas = await Promise.all(empresaPromises);

      empresas.forEach((emp) => {
        if (emp && emp.data) {
          empresaMap[emp.id] = {
            nome: emp.data.nome,
            logoUrl: emp.data.logoUrl,
          };
        }
      });
    }

    // Populate jobs with company data
    allData = allData.map((v) => {
      if (v.empresaId && empresaMap[v.empresaId]) {
        return {
          ...v,
          empresa: { id: v.empresaId!, ...empresaMap[v.empresaId] },
        };
      }
      if (v.empresaNome) {
        return {
          ...v,
          empresa: { id: 'manual', nome: v.empresaNome },
        };
      }
      return v;
    });

    // Sort in memory
    allData.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      allData = allData.filter(
        (v) =>
          v.titulo.toLowerCase().includes(keyword) ||
          v.descricao.toLowerCase().includes(keyword),
      );
    }

    if (params.salarioMin) {
      allData = allData.filter(
        (v) => (v.salarioMax || 0) >= (params.salarioMin || 0),
      );
    }

    const page = params.page || 1;
    const limitVal = params.limit || 10;
    const start = (page - 1) * limitVal;

    return {
      data: allData.slice(start, start + limitVal),
      total: allData.length,
      page,
      totalPages: Math.ceil(allData.length / limitVal),
    };
  },

  /**
   * Get job by ID (public)
   */
  async getById(id: string): Promise<Vaga> {
    const docRef = doc(db, COLLECTIONS.VAGAS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('Vaga not found');
    }

    const vagaData = snapshot.data();
    let empresaData = undefined;

    if (vagaData.empresaId) {
      try {
        const empresaDocRef = doc(db, COLLECTIONS.EMPRESAS, vagaData.empresaId);
        const empresaSnapshot = await getDoc(empresaDocRef);
        if (empresaSnapshot.exists()) {
          const emp = empresaSnapshot.data() as Empresa;
          empresaData = {
            id: empresaSnapshot.id,
            nome: emp.nome,
            logoUrl: emp.logoUrl,
          };
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    } else if (vagaData.empresaNome) {
      empresaData = {
        id: 'manual',
        nome: vagaData.empresaNome,
      };
    }

    return {
      id: snapshot.id,
      ...vagaData,
      empresa: empresaData,
    } as Vaga;
  },

  /**
   * Update job (recruiter)
   */
  async update(id: string, data: UpdateVagaDTO): Promise<Vaga> {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    const docRef = doc(db, COLLECTIONS.VAGAS, id);
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Vaga;
  },

  /**
   * Publish job (rascunho -> aberta)
   */
  async publish(id: string): Promise<Vaga> {
    const docRef = doc(db, COLLECTIONS.VAGAS, id);
    await updateDoc(docRef, {
      status: 'aberta',
      dataPublicacao: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Vaga;
  },

  /**
   * Pause job (aberta -> pausada)
   */
  async pause(id: string): Promise<Vaga> {
    const docRef = doc(db, COLLECTIONS.VAGAS, id);
    await updateDoc(docRef, {
      status: 'pausada',
      updatedAt: new Date().toISOString(),
    });
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Vaga;
  },

  /**
   * Resume job (pausada -> aberta)
   */
  async resume(id: string): Promise<Vaga> {
    const docRef = doc(db, COLLECTIONS.VAGAS, id);
    await updateDoc(docRef, {
      status: 'aberta',
      updatedAt: new Date().toISOString(),
    });
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Vaga;
  },

  /**
   * Close job
   */
  async close(id: string): Promise<Vaga> {
    const docRef = doc(db, COLLECTIONS.VAGAS, id);
    await updateDoc(docRef, {
      status: 'fechada',
      updatedAt: new Date().toISOString(),
    });
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Vaga;
  },

  /**
   * Delete job (only drafts)
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.VAGAS, id));
  },

  /**
   * Get applications for a job (recruiter)
   */
  async getCandidaturas(
    id: string,
    params: { status?: string; orderBy?: string } = {},
  ): Promise<{ data: Candidatura[]; meta: { total: number } }> {
    let q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('vagaId', '==', id),
    );

    if (params.status) {
      q = query(q, where('status', '==', params.status));
    }

    // Client side sorting for now if needed, or simple firestore sort
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Candidatura,
    );

    return {
      data,
      meta: { total: data.length },
    };
  },

  /**
   * Get application count for a job (recruiter)
   */
  async getCandidaturasCount(id: string): Promise<VagaCandidaturasCount> {
    const q = query(
      collection(db, COLLECTIONS.CANDIDATURAS),
      where('vagaId', '==', id),
    );
    const snapshot = await getDocs(q);

    // Calculate counts manually since we fetched all docs (or use separate count queries)
    // For small scale, fetching all is fine. For scale, maintain counters.
    const counts = {
      pendente: 0,
      em_analise: 0,
      aprovado_triagem: 0,
      entrevista: 0,
      aprovado: 0,
      reprovado: 0,
    };

    snapshot.forEach((doc) => {
      const status = doc.data().status as keyof typeof counts;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return {
      total: snapshot.size,
      byStatus: counts,
    };
  },
};
