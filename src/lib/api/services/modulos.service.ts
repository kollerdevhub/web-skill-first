import { db } from '../../firebase';
import { COLLECTIONS } from '../../firebase/collections';
import { uploadToCloudinary } from '../../cloudinary-upload';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { Modulo, CreateModuloDTO, UpdateModuloDTO } from '../types';

function normalizeDurationMinutes(value?: number | null): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.round(value));
}

function calculateCourseHours(modules: Modulo[]): number {
  const totalMinutes = modules.reduce(
    (sum, mod) => sum + Math.max(0, mod.duracaoEstimada || 0),
    0,
  );

  if (totalMinutes <= 0) return 0;
  return Number((totalMinutes / 60).toFixed(1));
}

/**
 * Modulos (Course Modules) API Service - Firestore Implementation
 * Modules are stored as a top-level collection 'modulos' with a 'cursoId' field
 */
export const modulosService = {
  /**
   * Recalculate and persist course workload (hours) based on lessons duration (minutes)
   */
  async recalculateCargaHoraria(cursoId: string): Promise<number> {
    const modules = await this.list(cursoId);
    const cargaHoraria = calculateCourseHours(modules);

    await updateDoc(doc(db, COLLECTIONS.CURSOS, cursoId), {
      cargaHoraria,
      updatedAt: new Date().toISOString(),
    });

    return cargaHoraria;
  },

  /**
   * List modules for a course (public)
   */
  async list(cursoId: string): Promise<Modulo[]> {
    try {
      // Query without sorting to avoid needing a composite index (cursoId + ordem)
      const q = query(
        collection(db, COLLECTIONS.MODULOS),
        where('cursoId', '==', cursoId),
      );

      const snapshot = await getDocs(q);
      const modules = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Modulo,
      );

      // Sort in memory
      return modules.sort((a, b) => a.ordem - b.ordem);
    } catch (error) {
      console.error('Erro ao listar módulos:', error);
      throw error;
    }
  },

  /**
   * Create a new module (admin/gestor)
   */
  async create(
    cursoId: string,
    data: CreateModuloDTO,
    options?: { skipDurationRecalculation?: boolean },
  ): Promise<Modulo> {
    try {
      const batch = writeBatch(db);

      const newModuleRef = doc(collection(db, COLLECTIONS.MODULOS));
      const normalizedData: CreateModuloDTO = {
        ...data,
        duracaoEstimada: normalizeDurationMinutes(data.duracaoEstimada),
      };
      // Strip undefined values — Firestore rejects them
      const cleanData = Object.fromEntries(
        Object.entries(normalizedData).filter(([, v]) => v !== undefined),
      );
      const moduleData = {
        ...cleanData,
        cursoId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      batch.set(newModuleRef, moduleData);

      // Update course totalModules
      const courseRef = doc(db, COLLECTIONS.CURSOS, cursoId);
      batch.update(courseRef, { totalModulos: increment(1) });

      await batch.commit();
      if (!options?.skipDurationRecalculation) {
        await this.recalculateCargaHoraria(cursoId);
      }

      return { id: newModuleRef.id, ...moduleData } as Modulo;
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      throw error;
    }
  },

  /**
   * Update module (admin/gestor)
   */
  async update(
    cursoId: string,
    moduloId: string,
    data: UpdateModuloDTO,
    options?: { skipDurationRecalculation?: boolean },
  ): Promise<Modulo> {
    const docRef = doc(db, COLLECTIONS.MODULOS, moduloId);
    const normalizedData: UpdateModuloDTO = {
      ...data,
      duracaoEstimada: normalizeDurationMinutes(data.duracaoEstimada),
    };
    const cleanData = Object.fromEntries(
      Object.entries(normalizedData).filter(([, value]) => value !== undefined),
    );
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: new Date().toISOString(),
    });
    if (!options?.skipDurationRecalculation) {
      await this.recalculateCargaHoraria(cursoId);
    }

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Modulo;
  },

  /**
   * Delete module (admin/gestor)
   */
  async delete(
    cursoId: string,
    moduloId: string,
    options?: { skipDurationRecalculation?: boolean },
  ): Promise<void> {
    const batch = writeBatch(db);

    const moduleRef = doc(db, COLLECTIONS.MODULOS, moduloId);
    batch.delete(moduleRef);

    // Update course totalModules
    const courseRef = doc(db, COLLECTIONS.CURSOS, cursoId);
    batch.update(courseRef, { totalModulos: increment(-1) });

    await batch.commit();
    if (!options?.skipDurationRecalculation) {
      await this.recalculateCargaHoraria(cursoId);
    }
  },

  /**
   * Upload video for module
   */
  async uploadVideo(
    cursoId: string,
    moduloId: string,
    file: File,
  ): Promise<{ videoUrl: string; videoPublicId: string }> {
    const { url, publicId } = await uploadToCloudinary(file, {
      resourceType: 'video',
      folder: 'web-skill-first/videos',
    });

    const docRef = doc(db, COLLECTIONS.MODULOS, moduloId);
    await updateDoc(docRef, {
      videoUrl: url,
      videoPublicId: publicId,
    });

    return { videoUrl: url, videoPublicId: publicId };
  },

  /**
   * Delete video from module
   */
  async deleteVideo(cursoId: string, moduloId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MODULOS, moduloId);
    await updateDoc(docRef, {
      videoUrl: null,
      videoPublicId: null,
    });
  },
};
