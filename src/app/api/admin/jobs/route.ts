import { NextResponse } from 'next/server';

// In-memory storage for server-side (simulates localStorage for API routes)
const initialJobs = [
  {
    id: '1',
    title: 'Desenvolvedor Full Stack',
    company: 'Tech Corp',
    department: 'Engenharia',
    description:
      'Procuramos um desenvolvedor full stack para trabalhar com React e Node.js em projetos inovadores.',
    requirements:
      'React, Node.js, TypeScript, PostgreSQL, 3+ anos de experiência',
    benefits: 'VR, VT, Plano de Saúde, Gympass, Day-off aniversário',
    responsibilities: 'Desenvolver features, code review, mentoria de juniors',
    salaryRange: 'R$ 8.000 - R$ 12.000',
    location: 'São Paulo, SP',
    type: 'remote',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    _count: { applications: 5 },
  },
  {
    id: '2',
    title: 'Frontend Developer React',
    company: 'StartupXYZ',
    department: 'Produto',
    description:
      'Vaga para desenvolvedor frontend com experiência em React e TypeScript.',
    requirements:
      'React, TypeScript, CSS-in-JS, Testes, 2+ anos de experiência',
    benefits: 'VR, Plano de Saúde, Stock Options',
    salaryRange: 'R$ 7.000 - R$ 10.000',
    location: 'Rio de Janeiro, RJ',
    type: 'hybrid',
    status: 'active',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    _count: { applications: 3 },
  },
  {
    id: '3',
    title: 'Backend Developer Node.js',
    company: 'FinTech Solutions',
    department: 'Engenharia',
    description:
      'Desenvolvedor backend para construir APIs escaláveis no setor financeiro.',
    requirements:
      'Node.js, PostgreSQL, Redis, Microservices, 4+ anos de experiência',
    benefits: 'VR, VT, Plano de Saúde, PLR',
    salaryRange: 'R$ 9.000 - R$ 14.000',
    location: 'Belo Horizonte, MG',
    type: 'onsite',
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    _count: { applications: 2 },
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudTech',
    department: 'Infraestrutura',
    description:
      'Engenheiro DevOps com experiência em AWS, Docker e Kubernetes.',
    requirements:
      'AWS, Docker, Kubernetes, Terraform, CI/CD, 3+ anos de experiência',
    benefits: 'VR, Plano de Saúde, Home Office integral',
    salaryRange: 'R$ 10.000 - R$ 15.000',
    location: 'Curitiba, PR',
    type: 'remote',
    status: 'active',
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-02-05T00:00:00Z',
    _count: { applications: 4 },
  },
  {
    id: '5',
    title: 'Tech Lead',
    company: 'Digital Agency',
    department: 'Tecnologia',
    description:
      'Liderança técnica para equipe de 5 desenvolvedores em projetos web.',
    requirements:
      'React, Node.js, Liderança, Arquitetura, 5+ anos de experiência',
    benefits: 'VR, VT, Plano de Saúde, Bônus',
    salaryRange: 'R$ 15.000 - R$ 20.000',
    location: 'São Paulo, SP',
    type: 'hybrid',
    status: 'active',
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
    _count: { applications: 8 },
  },
];

// Use a global variable to persist data across requests in development
const globalForJobs = globalThis as unknown as { jobs: typeof initialJobs };
if (!globalForJobs.jobs) {
  globalForJobs.jobs = [...initialJobs];
}

export async function GET() {
  return NextResponse.json(globalForJobs.jobs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newJob = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { applications: 0 },
    };
    globalForJobs.jobs.unshift(newJob);
    return NextResponse.json(newJob, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar vaga' }, { status: 500 });
  }
}
