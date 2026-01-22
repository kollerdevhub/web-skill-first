import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/courses/[id] - Busca curso por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    include: {
      _count: {
        select: { enrollments: true, certificates: true },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json(course);
}

// PUT /api/admin/courses/[id] - Atualiza curso
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  const course = await db.course.update({
    where: { id },
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

  return NextResponse.json(course);
}

// DELETE /api/admin/courses/[id] - Exclui curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await db.course.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
