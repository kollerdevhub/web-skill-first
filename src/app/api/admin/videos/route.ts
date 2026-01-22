import { NextResponse } from 'next/server';

// Real Cloudinary demo videos
const initialVideos = [
  {
    id: '1',
    url: 'https://res.cloudinary.com/demo/video/upload/v1689697988/samples/elephants.mp4',
    publicId: 'samples/elephants',
    thumbnailUrl:
      'https://res.cloudinary.com/demo/video/upload/so_0/v1689697988/samples/elephants.jpg',
    duration: 47,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    url: 'https://res.cloudinary.com/demo/video/upload/v1689697988/samples/sea-turtle.mp4',
    publicId: 'samples/sea-turtle',
    thumbnailUrl:
      'https://res.cloudinary.com/demo/video/upload/so_0/v1689697988/samples/sea-turtle.jpg',
    duration: 34,
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '3',
    url: 'https://res.cloudinary.com/demo/video/upload/v1689697988/samples/cld-sample-video.mp4',
    publicId: 'samples/cld-sample-video',
    thumbnailUrl:
      'https://res.cloudinary.com/demo/video/upload/so_0/v1689697988/samples/cld-sample-video.jpg',
    duration: 22,
    createdAt: '2024-01-10T00:00:00Z',
  },
];

const globalForVideos = globalThis as unknown as {
  videos: typeof initialVideos;
};
if (!globalForVideos.videos) {
  globalForVideos.videos = [...initialVideos];
}

export async function GET() {
  return NextResponse.json(
    globalForVideos.videos.map((v) => ({
      ...v,
      secureUrl: v.url,
    })),
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newVideo = {
      id: Date.now().toString(),
      url: body.url,
      publicId: body.publicId,
      thumbnailUrl: body.thumbnailUrl || null,
      duration: body.duration || 0,
      createdAt: new Date().toISOString(),
    };
    globalForVideos.videos.unshift(newVideo);
    return NextResponse.json(
      { ...newVideo, secureUrl: newVideo.url },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Erro ao salvar vídeo' },
      { status: 500 },
    );
  }
}
