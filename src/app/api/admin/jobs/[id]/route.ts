import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// PUT /api/admin/jobs/[id] - Atualiza vaga
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

  const job = await db.job.update({
    where: { id },
    data: {
      title: data.title,
      company: data.company,
      department: data.department || null,
      description: data.description,
      requirements: data.requirements,
      benefits: data.benefits || null,
      salaryRange: data.salaryRange || null,
      location: data.location || null,
      type: data.type || 'hybrid',
      status: data.status || 'active',
    },
  });

  return NextResponse.json(job);
}

// DELETE /api/admin/jobs/[id] - Exclui vaga
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await db.job.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
