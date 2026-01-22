import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List all videos
export async function GET() {
  try {
    console.log('[API] GET /api/admin/videos');
    const videos = await db.video.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log('[API] Videos encontrados:', videos.length);
    return NextResponse.json(videos);
  } catch (error) {
    console.error('[API] Erro no GET /api/admin/videos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos' },
      { status: 500 },
    );
  }
}

// POST: Save a new video
export async function POST(req: NextRequest) {
  try {
    console.log('[API] POST /api/admin/videos');
    const { url, publicId, thumbnailUrl, duration } = await req.json();
    console.log('[API] Dados recebidos:', {
      url,
      publicId,
      thumbnailUrl,
      duration,
    });
    if (!url || !publicId) {
      console.warn('[API] Campos obrigatórios faltando');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }
    const video = await db.video.create({
      data: {
        url,
        publicId,
        thumbnailUrl,
        duration,
      },
    });
    console.log('[API] Vídeo salvo com sucesso:', video.id);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('[API] Erro no POST /api/admin/videos:', error);
    return NextResponse.json(
      { error: 'Failed to save video' },
      { status: 500 },
    );
  }
}
