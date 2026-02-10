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
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { Modulo, CreateModuloDTO, UpdateModuloDTO } from '../types';

/**
 * Modulos (Course Modules) API Service - Firestore Implementation
 * Modules are stored as a top-level collection 'modulos' with a 'cursoId' field
 */
export const modulosService = {
  /**
   * List modules for a course (public)
   */
  async list(cursoId: string): Promise<Modulo[]> {
    const q = query(
      collection(db, COLLECTIONS.MODULOS),
      where('cursoId', '==', cursoId),
      orderBy('ordem', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Modulo,
    );
  },

  /**
   * Create a new module (admin/gestor)
   */
  async create(cursoId: string, data: CreateModuloDTO): Promise<Modulo> {
    const batch = writeBatch(db);

    const newModuleRef = doc(collection(db, COLLECTIONS.MODULOS));
    // Strip undefined values — Firestore rejects them
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
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

    return { id: newModuleRef.id, ...moduleData } as Modulo;
  },

  /**
   * Update module (admin/gestor)
   */
  async update(
    cursoId: string,
    moduloId: string,
    data: UpdateModuloDTO,
  ): Promise<Modulo> {
    const docRef = doc(db, COLLECTIONS.MODULOS, moduloId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Modulo;
  },

  /**
   * Delete module (admin/gestor)
   */
  async delete(cursoId: string, moduloId: string): Promise<void> {
    const batch = writeBatch(db);

    const moduleRef = doc(db, COLLECTIONS.MODULOS, moduloId);
    batch.delete(moduleRef);

    // Update course totalModules
    const courseRef = doc(db, COLLECTIONS.CURSOS, cursoId);
    batch.update(courseRef, { totalModulos: increment(-1) });

    await batch.commit();
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
