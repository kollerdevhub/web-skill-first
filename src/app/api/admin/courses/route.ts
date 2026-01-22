import { NextResponse } from 'next/server';

const initialCourses = [
  {
    id: '1',
    title: 'React Avançado',
    description:
      'Domine hooks, context, e padrões avançados do React. Aprenda a criar aplicações escaláveis e de alta performance.',
    category: 'Frontend',
    level: 'advanced',
    duration: 720,
    imageUrl: null,
    videoUrl: null,
    videoPublicId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    _count: { enrollments: 45 },
  },
  {
    id: '2',
    title: 'Node.js do Zero ao Deploy',
    description:
      'Construa APIs RESTful profissionais com Node.js. Do básico até o deploy em produção.',
    category: 'Backend',
    level: 'intermediate',
    duration: 900,
    imageUrl: null,
    videoUrl: null,
    videoPublicId: null,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    _count: { enrollments: 38 },
  },
  {
    id: '3',
    title: 'TypeScript Completo',
    description:
      'Tipagem avançada e boas práticas com TypeScript. Melhore a qualidade do seu código.',
    category: 'Linguagens',
    level: 'intermediate',
    duration: 600,
    imageUrl: null,
    videoUrl: null,
    videoPublicId: null,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    _count: { enrollments: 52 },
  },
  {
    id: '4',
    title: 'Next.js na Prática',
    description:
      'Construa aplicações full-stack com Next.js. Server Components, App Router e muito mais.',
    category: 'Frontend',
    level: 'intermediate',
    duration: 480,
    imageUrl: null,
    videoUrl: null,
    videoPublicId: null,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    _count: { enrollments: 67 },
  },
  {
    id: '5',
    title: 'Docker e Kubernetes',
    description:
      'Containerização e orquestração de aplicações. Aprenda DevOps na prática.',
    category: 'DevOps',
    level: 'advanced',
    duration: 840,
    imageUrl: null,
    videoUrl: null,
    videoPublicId: null,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
    _count: { enrollments: 29 },
  },
  {
    id: '6',
    title: 'AWS para Desenvolvedores',
    description:
      'Deploy e infraestrutura na nuvem com AWS. EC2, S3, Lambda e muito mais.',
    category: 'Cloud',
    level: 'intermediate',
    duration: 960,
    imageUrl: null,
    videoUrl: null,
    videoPublicId: null,
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
    _count: { enrollments: 41 },
  },
];

const globalForCourses = globalThis as unknown as {
  courses: typeof initialCourses;
};
if (!globalForCourses.courses) {
  globalForCourses.courses = [...initialCourses];
}

export async function GET() {
  return NextResponse.json(globalForCourses.courses);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCourse = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { enrollments: 0 },
    };
    globalForCourses.courses.unshift(newCourse);
    return NextResponse.json(newCourse, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar curso' }, { status: 500 });
  }
}

// Export the global for use in other route files
export { globalForCourses };
