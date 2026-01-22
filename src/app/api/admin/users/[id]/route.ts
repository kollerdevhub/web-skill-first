import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH /api/admin/users/[id] - Atualiza usuário (role)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  const user = await db.user.update({
    where: { id },
    data: {
      role: data.role,
    },
  });

  return NextResponse.json(user);
}
