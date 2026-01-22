import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample courses
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { id: 'course-1' },
      update: {},
      create: {
        id: 'course-1',
        title: 'React Avançado: Hooks, Context e Patterns',
        description:
          'Domine os conceitos avançados do React como hooks customizados, Context API, render props e compound components.',
        category: 'Frontend',
        level: 'advanced',
        duration: 720,
        imageUrl:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-2' },
      update: {},
      create: {
        id: 'course-2',
        title: 'Node.js do Zero ao Deploy',
        description:
          'Aprenda a construir APIs RESTful profissionais com Node.js, Express, autenticação JWT e deploy na AWS.',
        category: 'Backend',
        level: 'intermediate',
        duration: 900,
        imageUrl:
          'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-3' },
      update: {},
      create: {
        id: 'course-3',
        title: 'TypeScript Completo',
        description:
          'Tipagem avançada, generics, decorators e boas práticas para escrever código TypeScript profissional.',
        category: 'Linguagens',
        level: 'intermediate',
        duration: 480,
        imageUrl:
          'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-4' },
      update: {},
      create: {
        id: 'course-4',
        title: 'Next.js 14: Full Stack com App Router',
        description:
          'Construa aplicações full-stack modernas com Next.js 14, Server Components, Server Actions e muito mais.',
        category: 'Frontend',
        level: 'advanced',
        duration: 600,
        imageUrl:
          'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-5' },
      update: {},
      create: {
        id: 'course-5',
        title: 'Docker e Kubernetes na Prática',
        description:
          'Aprenda containerização com Docker e orquestração com Kubernetes para deploy de aplicações escaláveis.',
        category: 'DevOps',
        level: 'intermediate',
        duration: 540,
        imageUrl:
          'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800',
      },
    }),
    prisma.course.upsert({
      where: { id: 'course-6' },
      update: {},
      create: {
        id: 'course-6',
        title: 'Introdução à Programação',
        description:
          'Curso para iniciantes que querem dar os primeiros passos na programação com lógica e algoritmos.',
        category: 'Fundamentos',
        level: 'beginner',
        duration: 360,
        imageUrl:
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
      },
    }),
  ]);

  console.log(`✅ Created ${courses.length} courses`);

  // Create sample jobs
  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { id: 'job-1' },
      update: {},
      create: {
        id: 'job-1',
        title: 'Desenvolvedor Full Stack Sênior',
        company: 'Tech Solutions',
        department: 'Engenharia',
        description:
          'Buscamos um desenvolvedor full stack sênior para liderar projetos inovadores em nossa equipe de produto.',
        requirements:
          '- 5+ anos de experiência com React e Node.js\n- Conhecimento em TypeScript\n- Experiência com bancos de dados SQL e NoSQL\n- Inglês avançado',
        benefits:
          '- Vale alimentação R$ 1.000\n- Plano de saúde\n- Gympass\n- Home office flexível',
        salaryRange: 'R$ 15.000 - R$ 20.000',
        location: 'São Paulo, SP',
        type: 'hybrid',
        status: 'active',
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-2' },
      update: {},
      create: {
        id: 'job-2',
        title: 'Frontend Developer React',
        company: 'StartupXYZ',
        department: 'Produto',
        description:
          'Vaga para desenvolvedor frontend com foco em criar interfaces incríveis para nossos usuários.',
        requirements:
          '- 3+ anos com React\n- Experiência com Next.js\n- Conhecimento em CSS/Tailwind\n- Testes unitários',
        benefits:
          '- Trabalho 100% remoto\n- Stock options\n- Budget para educação',
        salaryRange: 'R$ 10.000 - R$ 14.000',
        location: 'Remoto',
        type: 'remote',
        status: 'active',
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-3' },
      update: {},
      create: {
        id: 'job-3',
        title: 'Backend Developer Node.js',
        company: 'FinTech Solutions',
        department: 'Engenharia',
        description:
          'Desenvolvedor backend para construir APIs escaláveis e seguras no setor financeiro.',
        requirements:
          '- 4+ anos com Node.js\n- Experiência com microserviços\n- Conhecimento em AWS\n- Banco de dados PostgreSQL',
        benefits:
          '- PLR\n- Plano odontológico\n- Vale transporte\n- Auxílio home office',
        salaryRange: 'R$ 12.000 - R$ 16.000',
        location: 'Belo Horizonte, MG',
        type: 'hybrid',
        status: 'active',
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-4' },
      update: {},
      create: {
        id: 'job-4',
        title: 'DevOps Engineer',
        company: 'CloudTech',
        department: 'Infraestrutura',
        description:
          'Engenheiro DevOps para automatizar e melhorar nossos processos de CI/CD e infraestrutura na nuvem.',
        requirements:
          '- Experiência com AWS, GCP ou Azure\n- Kubernetes e Docker\n- Terraform/Ansible\n- CI/CD pipelines',
        benefits:
          '- Salário competitivo\n- Ambiente inovador\n- Certificações pagas',
        salaryRange: 'R$ 14.000 - R$ 18.000',
        location: 'Curitiba, PR',
        type: 'remote',
        status: 'active',
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-5' },
      update: {},
      create: {
        id: 'job-5',
        title: 'Product Designer',
        company: 'Design Studio',
        department: 'Design',
        description:
          'Designer de produto para criar experiências memoráveis em nossos produtos digitais.',
        requirements:
          '- Portfolio com cases de produto\n- Figma avançado\n- Design System\n- Prototipagem',
        benefits: '- Flexibilidade total\n- MacBook Pro\n- Cursos pagos',
        salaryRange: 'R$ 8.000 - R$ 12.000',
        location: 'Rio de Janeiro, RJ',
        type: 'hybrid',
        status: 'active',
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-6' },
      update: {},
      create: {
        id: 'job-6',
        title: 'Estágio em Desenvolvimento',
        company: 'Tech Academy',
        department: 'Tecnologia',
        description:
          'Oportunidade de estágio para quem está começando na área de desenvolvimento.',
        requirements:
          '- Cursando Ciência da Computação ou áreas correlatas\n- Conhecimento básico em programação\n- Vontade de aprender',
        benefits: '- Bolsa auxílio\n- Vale transporte\n- Mentoria',
        salaryRange: 'R$ 1.500 - R$ 2.000',
        location: 'São Paulo, SP',
        type: 'onsite',
        status: 'active',
      },
    }),
  ]);

  console.log(`✅ Created ${jobs.length} jobs`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
