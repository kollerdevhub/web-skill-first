import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/jobs - Lista todas as vagas
export async function GET() {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await db.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return NextResponse.json(jobs);
}

// POST /api/admin/jobs - Cria nova vaga
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  const job = await db.job.create({
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

  return NextResponse.json(job, { status: 201 });
}
