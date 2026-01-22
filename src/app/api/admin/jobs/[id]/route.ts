import { NextResponse } from 'next/server';

// Access the global jobs array
const globalForJobs = globalThis as unknown as {
  jobs: Array<Record<string, unknown>>;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const index = globalForJobs.jobs?.findIndex((j) => j.id === id);
    if (index === undefined || index === -1) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 },
      );
    }

    globalForJobs.jobs[index] = {
      ...globalForJobs.jobs[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(globalForJobs.jobs[index]);
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar vaga' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const index = globalForJobs.jobs?.findIndex((j) => j.id === id);

    if (index === undefined || index === -1) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 },
      );
    }

    globalForJobs.jobs.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao excluir vaga' },
      { status: 500 },
    );
  }
}
