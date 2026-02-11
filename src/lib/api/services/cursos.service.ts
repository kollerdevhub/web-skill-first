import { db } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import { uploadToCloudinary } from '../../cloudinary-upload';
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
  limit,
  getCountFromServer,
} from 'firebase/firestore';
import {
  Curso,
  CreateCursoDTO,
  UpdateCursoDTO,
  CursoSearchParams,
  CursoEstatisticas,
  PaginatedResponse,
} from '../types';

/**
 * Cursos (Courses) API Service - Firestore Implementation
 */
export const cursosService = {
  /**
   * Create a new course (admin/gestor)
   */
  async create(data: CreateCursoDTO): Promise<Curso> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CURSOS), {
      ...data,
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalInscritos: 0,
      totalModulos: 0,
    });

    // Fetch the created doc to return full object
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Curso;
  },

  /**
   * Search/list courses (public)
   */
  async search(
    params: CursoSearchParams = {},
  ): Promise<PaginatedResponse<Curso>> {
    let q = query(collection(db, COLLECTIONS.CURSOS));

    if (params.q || params.keyword) {
      // Simple client-side filtering for now as Firestore full-text search requires Algolia/Typesense
      // OR we can implement basic "starts with" search
    }

    if (params.categoria) {
      q = query(q, where('categoria', '==', params.categoria));
    }

    if (params.nivel) {
      q = query(q, where('nivel', '==', params.nivel));
    }

    // Default ordering
    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const allData = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Curso,
    );

    // Client-side filtering for search term if needed
    let filteredData =
      params.q || params.keyword
        ? allData.filter((c) =>
            c.titulo
              .toLowerCase()
              .includes((params.q || params.keyword || '').toLowerCase()),
          )
        : allData;

    if (params.publishedOnly) {
      filteredData = filteredData.filter(
        (course) => course.status === 'published' || course.ativo,
      );
    }

    // Pagination (mocked for now, just slicing array)
    // Real firestore pagination uses startAfter
    const page = params.page || 1;
    const limitVal = params.limit || 10;
    const start = (page - 1) * limitVal;
    const end = start + limitVal;

    return {
      data: filteredData.slice(start, end),
      total: filteredData.length,
      page,
      totalPages: Math.ceil(filteredData.length / limitVal),
    };
  },

  /**
   * Get featured courses (public)
   */
  async getDestaque(): Promise<Curso[]> {
    const q = query(
      collection(db, COLLECTIONS.CURSOS),
      where('destaque', '==', true),
      limit(6),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Curso);
  },

  /**
   * Get course by ID (public)
   */
  async getById(id: string): Promise<Curso> {
    const docRef = doc(db, COLLECTIONS.CURSOS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Course not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Curso;
  },

  /**
   * Update course (admin/gestor)
   */
  async update(id: string, data: UpdateCursoDTO): Promise<Curso> {
    const docRef = doc(db, COLLECTIONS.CURSOS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Curso;
  },

  /**
   * Upload course thumbnail
   */
  async uploadThumbnail(
    id: string,
    file: File,
  ): Promise<{ thumbnailUrl: string }> {
    const { url } = await uploadToCloudinary(file, {
      folder: 'web-skill-first/thumbnails',
    });

    const docRef = doc(db, COLLECTIONS.CURSOS, id);
    await updateDoc(docRef, { thumbnailUrl: url });

    return { thumbnailUrl: url };
  },

  /**
   * Publish course
   */
  async publish(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CURSOS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error('Curso não encontrado');
    }

    const course = snapshot.data() as Curso;
    if (!course.thumbnailUrl) {
      throw new Error('Adicione uma capa antes de publicar o curso');
    }

    const modulesCountQuery = query(
      collection(db, COLLECTIONS.MODULOS),
      where('cursoId', '==', id),
    );
    const modulesCountSnapshot = await getCountFromServer(modulesCountQuery);
    const totalModulos = modulesCountSnapshot.data().count;

    if (totalModulos <= 0) {
      throw new Error('Adicione pelo menos uma aula antes de publicar o curso');
    }

    await updateDoc(docRef, {
      ativo: true,
      status: 'published',
      dataPublicacao: new Date().toISOString(),
      totalModulos,
    });
  },

  /**
   * Unpublish course
   */
  async unpublish(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CURSOS, id);
    await updateDoc(docRef, {
      ativo: false,
      status: 'draft',
    });
  },

  /**
   * Delete course (admin only)
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.CURSOS, id));
  },

  /**
   * Get course statistics (admin/gestor)
   */
  async getStats(id: string): Promise<CursoEstatisticas> {
    // This would ideally require aggregation queries or counters
    // For now returning basic data from course doc
    const course = await this.getById(id);

    return {
      totalInscritos: course.totalInscritos || 0,
      concluidos: 0, // Placeholder
      emAndamento: course.totalInscritos || 0,
      mediaNotas: 0,
    };
  },

  /**
   * Get detailed course report (admin/gestor)
   */
  async getReport(): Promise<unknown> {
    return {}; // Placeholder
  },

  /**
   * Get completion report by module (admin/gestor)
   */
  async getConclusionReport(): Promise<unknown> {
    return []; // Placeholder
  },
};
