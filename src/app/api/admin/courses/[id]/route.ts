import { NextResponse } from 'next/server';

const globalForCourses = globalThis as unknown as {
  courses: Array<Record<string, unknown>>;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const course = globalForCourses.courses?.find((c) => c.id === id);

  if (!course) {
    return NextResponse.json(
      { error: 'Curso não encontrado' },
      { status: 404 },
    );
  }

  return NextResponse.json(course);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const index = globalForCourses.courses?.findIndex((c) => c.id === id);
    if (index === undefined || index === -1) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 },
      );
    }

    globalForCourses.courses[index] = {
      ...globalForCourses.courses[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(globalForCourses.courses[index]);
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
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
    const index = globalForCourses.courses?.findIndex((c) => c.id === id);

    if (index === undefined || index === -1) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 },
      );
    }

    globalForCourses.courses.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao excluir curso' },
      { status: 500 },
    );
  }
}
