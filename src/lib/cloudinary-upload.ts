/**
 * Upload de arquivo para o Cloudinary com suporte a progresso.
 *
 * Usa XMLHttpRequest para capturar eventos de progresso do upload,
 * permitindo barras de progresso visuais na UI.
 */
export async function uploadToCloudinary(
  file: File,
  options?: {
    resourceType?: 'image' | 'video' | 'raw';
    folder?: string;
    onProgress?: (percent: number) => void;
  },
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );
  if (options?.folder) formData.append('folder', options.folder);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const resourceType = options?.resourceType || 'image';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progresso do upload
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && options?.onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url, publicId: data.public_id });
        } catch {
          reject(new Error('Erro ao processar resposta do Cloudinary'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(
            new Error(
              error.error?.message || 'Falha no upload para o Cloudinary',
            ),
          );
        } catch {
          reject(new Error(`Upload falhou com status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Erro de rede durante o upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelado'));
    });

    xhr.open('POST', url);
    xhr.send(formData);
  });
}
