import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadVideo(file: File): Promise<{
  url: string;
  publicId: string;
}> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'video',
          folder: 'web-skill-first/videos',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      )
      .end(buffer);
  });
}

export function getVideoUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    secure: true,
  });
}
