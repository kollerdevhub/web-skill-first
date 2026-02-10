export async function uploadToCloudinary(
  file: File,
  options?: {
    resourceType?: 'image' | 'video' | 'raw';
    folder?: string;
  },
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );
  if (options?.folder) formData.append('folder', options.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${options?.resourceType || 'image'}/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to upload to Cloudinary');
  }

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}
