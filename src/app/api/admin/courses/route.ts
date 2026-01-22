import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/courses - Lista todos os cursos
export async function GET() {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const courses = await db.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
  });

  return NextResponse.json(courses);
}

// POST /api/admin/courses - Cria novo curso
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  const course = await db.course.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level || 'beginner',
      duration: data.duration || 60,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      videoPublicId: data.videoPublicId || null,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
