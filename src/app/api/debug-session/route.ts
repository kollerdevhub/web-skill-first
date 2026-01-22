import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();

  // Buscar dados direto do banco
  const user = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id } })
    : null;

  return NextResponse.json({
    session,
    userFromDb: user,
  });
}
