import { NextResponse } from 'next/server';

const globalForUsers = globalThis as unknown as {
  users: Array<Record<string, unknown>>;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const index = globalForUsers.users?.findIndex((u) => u.id === id);
    if (index === undefined || index === -1) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }

    globalForUsers.users[index] = {
      ...globalForUsers.users[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(globalForUsers.users[index]);
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 },
    );
  }
}
