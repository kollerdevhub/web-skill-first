// Types for the data models
export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: 'admin' | 'candidate';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  imageUrl?: string;
  videoUrl?: string;
  instructor: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  department?: string;
  description: string;
  requirements: string;
  benefits?: string;
  responsibilities?: string;
  salaryRange?: string;
  location?: string;
  type: 'remote' | 'hybrid' | 'onsite';
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  status: 'in_progress' | 'completed';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string;
}

// Database state interface
export interface DatabaseState {
  users: User[];
  courses: Course[];
  jobs: Job[];
  videos: Video[];
  enrollments: Enrollment[];
  applications: JobApplication[];
  certificates: Certificate[];
}

// Initial fake data
const initialData: DatabaseState = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@webskillfirst.com.br',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin',
      phone: '(11) 99999-9999',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Maria Silva',
      email: 'maria@email.com',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      role: 'candidate',
      phone: '(11) 98888-8888',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '3',
      name: 'João Santos',
      email: 'joao@email.com',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
      role: 'candidate',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana@email.com',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      role: 'candidate',
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
    },
    {
      id: '5',
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
      role: 'candidate',
      createdAt: '2024-02-20T00:00:00Z',
      updatedAt: '2024-02-20T00:00:00Z',
    },
  ],
  courses: [
    {
      id: '1',
      title: 'React Avançado',
      description:
        'Domine hooks, context, e padrões avançados do React. Aprenda a criar aplicações escaláveis e de alta performance.',
      category: 'Frontend',
      level: 'advanced',
      duration: 12,
      imageUrl: '/courses/react.jpg',
      instructor: 'João Silva',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Node.js do Zero ao Deploy',
      description:
        'Construa APIs RESTful profissionais com Node.js. Do básico até o deploy em produção.',
      category: 'Backend',
      level: 'intermediate',
      duration: 15,
      imageUrl: '/courses/node.jpg',
      instructor: 'Maria Santos',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
    },
    {
      id: '3',
      title: 'TypeScript Completo',
      description:
        'Tipagem avançada e boas práticas com TypeScript. Melhore a qualidade do seu código.',
      category: 'Linguagens',
      level: 'intermediate',
      duration: 10,
      imageUrl: '/courses/typescript.jpg',
      instructor: 'Pedro Costa',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
    {
      id: '4',
      title: 'Next.js na Prática',
      description:
        'Construa aplicações full-stack com Next.js. Server Components, App Router e muito mais.',
      category: 'Frontend',
      level: 'intermediate',
      duration: 8,
      imageUrl: '/courses/nextjs.jpg',
      instructor: 'Ana Lima',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
    {
      id: '5',
      title: 'Docker e Kubernetes',
      description:
        'Containerização e orquestração de aplicações. Aprenda DevOps na prática.',
      category: 'DevOps',
      level: 'advanced',
      duration: 14,
      imageUrl: '/courses/docker.jpg',
      instructor: 'Carlos Mendes',
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
    },
    {
      id: '6',
      title: 'AWS para Desenvolvedores',
      description:
        'Deploy e infraestrutura na nuvem com AWS. EC2, S3, Lambda e muito mais.',
      category: 'Cloud',
      level: 'intermediate',
      duration: 16,
      imageUrl: '/courses/aws.jpg',
      instructor: 'Lucia Ferreira',
      createdAt: '2024-02-20T00:00:00Z',
      updatedAt: '2024-02-20T00:00:00Z',
    },
  ],
  jobs: [
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
      responsibilities:
        'Desenvolver features, code review, mentoria de juniors',
      salaryRange: 'R$ 8.000 - R$ 12.000',
      location: 'São Paulo, SP',
      type: 'remote',
      status: 'active',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
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
    },
  ],
  videos: [
    {
      id: '1',
      title: 'Introdução ao React',
      url: 'https://example.com/videos/react-intro.mp4',
      publicId: 'web-skill-first/videos/react-intro',
      thumbnailUrl: 'https://example.com/thumbnails/react-intro.jpg',
      duration: 1200,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Hooks Avançados',
      url: 'https://example.com/videos/hooks.mp4',
      publicId: 'web-skill-first/videos/hooks',
      thumbnailUrl: 'https://example.com/thumbnails/hooks.jpg',
      duration: 1800,
      createdAt: '2024-01-05T00:00:00Z',
    },
    {
      id: '3',
      title: 'Node.js Básico',
      url: 'https://example.com/videos/node-basic.mp4',
      publicId: 'web-skill-first/videos/node-basic',
      thumbnailUrl: 'https://example.com/thumbnails/node-basic.jpg',
      duration: 2400,
      createdAt: '2024-01-10T00:00:00Z',
    },
  ],
  enrollments: [
    {
      id: '1',
      userId: '2',
      courseId: '1',
      progress: 75,
      status: 'in_progress',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
    },
    {
      id: '2',
      userId: '2',
      courseId: '2',
      progress: 45,
      status: 'in_progress',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-20T00:00:00Z',
    },
    {
      id: '3',
      userId: '3',
      courseId: '1',
      progress: 100,
      status: 'completed',
      completedAt: '2024-02-10T00:00:00Z',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
    },
    {
      id: '4',
      userId: '4',
      courseId: '3',
      progress: 30,
      status: 'in_progress',
      createdAt: '2024-02-05T00:00:00Z',
      updatedAt: '2024-02-18T00:00:00Z',
    },
  ],
  applications: [
    {
      id: '1',
      userId: '2',
      jobId: '1',
      status: 'reviewing',
      appliedAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-05T00:00:00Z',
    },
    {
      id: '2',
      userId: '3',
      jobId: '2',
      status: 'pending',
      appliedAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
    },
    {
      id: '3',
      userId: '4',
      jobId: '1',
      status: 'accepted',
      appliedAt: '2024-01-25T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
    },
  ],
  certificates: [
    {
      id: '1',
      userId: '3',
      courseId: '1',
      certificateNumber: 'CERT-2024-001',
      issuedAt: '2024-02-10T00:00:00Z',
    },
    {
      id: '2',
      userId: '2',
      courseId: '4',
      certificateNumber: 'CERT-2024-002',
      issuedAt: '2024-02-15T00:00:00Z',
    },
  ],
};

const STORAGE_KEY = 'web-skill-first-db';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Get data from localStorage or use initial data
function getData(): DatabaseState {
  if (!isClient) {
    return initialData;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialData;
    }
  }

  // Initialize with fake data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

// Save data to localStorage
function saveData(data: DatabaseState): void {
  if (isClient) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Database operations
export const db = {
  // Users
  users: {
    findMany: () => getData().users,
    findById: (id: string) => getData().users.find((u) => u.id === id),
    findByEmail: (email: string) =>
      getData().users.find((u) => u.email === email),
    count: () => getData().users.length,
    create: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = getData();
      const newUser: User = {
        ...user,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.users.push(newUser);
      saveData(data);
      return newUser;
    },
    update: (id: string, updates: Partial<User>) => {
      const data = getData();
      const index = data.users.findIndex((u) => u.id === id);
      if (index !== -1) {
        data.users[index] = {
          ...data.users[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveData(data);
        return data.users[index];
      }
      return null;
    },
    delete: (id: string) => {
      const data = getData();
      data.users = data.users.filter((u) => u.id !== id);
      saveData(data);
    },
  },

  // Courses
  courses: {
    findMany: () => getData().courses,
    findById: (id: string) => getData().courses.find((c) => c.id === id),
    count: () => getData().courses.length,
    create: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = getData();
      const newCourse: Course = {
        ...course,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.courses.push(newCourse);
      saveData(data);
      return newCourse;
    },
    update: (id: string, updates: Partial<Course>) => {
      const data = getData();
      const index = data.courses.findIndex((c) => c.id === id);
      if (index !== -1) {
        data.courses[index] = {
          ...data.courses[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveData(data);
        return data.courses[index];
      }
      return null;
    },
    delete: (id: string) => {
      const data = getData();
      data.courses = data.courses.filter((c) => c.id !== id);
      saveData(data);
    },
  },

  // Jobs
  jobs: {
    findMany: () => getData().jobs,
    findById: (id: string) => getData().jobs.find((j) => j.id === id),
    count: () => getData().jobs.length,
    create: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = getData();
      const newJob: Job = {
        ...job,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.jobs.push(newJob);
      saveData(data);
      return newJob;
    },
    update: (id: string, updates: Partial<Job>) => {
      const data = getData();
      const index = data.jobs.findIndex((j) => j.id === id);
      if (index !== -1) {
        data.jobs[index] = {
          ...data.jobs[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveData(data);
        return data.jobs[index];
      }
      return null;
    },
    delete: (id: string) => {
      const data = getData();
      data.jobs = data.jobs.filter((j) => j.id !== id);
      saveData(data);
    },
  },

  // Videos
  videos: {
    findMany: () => getData().videos,
    findById: (id: string) => getData().videos.find((v) => v.id === id),
    count: () => getData().videos.length,
    create: (video: Omit<Video, 'id' | 'createdAt'>) => {
      const data = getData();
      const newVideo: Video = {
        ...video,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      data.videos.push(newVideo);
      saveData(data);
      return newVideo;
    },
    delete: (id: string) => {
      const data = getData();
      data.videos = data.videos.filter((v) => v.id !== id);
      saveData(data);
    },
  },

  // Enrollments
  enrollments: {
    findMany: () => getData().enrollments,
    findByUserId: (userId: string) =>
      getData().enrollments.filter((e) => e.userId === userId),
    count: () => getData().enrollments.length,
    create: (
      enrollment: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
      const data = getData();
      const newEnrollment: Enrollment = {
        ...enrollment,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.enrollments.push(newEnrollment);
      saveData(data);
      return newEnrollment;
    },
    update: (id: string, updates: Partial<Enrollment>) => {
      const data = getData();
      const index = data.enrollments.findIndex((e) => e.id === id);
      if (index !== -1) {
        data.enrollments[index] = {
          ...data.enrollments[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveData(data);
        return data.enrollments[index];
      }
      return null;
    },
  },

  // Job Applications
  applications: {
    findMany: () => getData().applications,
    findByUserId: (userId: string) =>
      getData().applications.filter((a) => a.userId === userId),
    count: () => getData().applications.length,
    create: (
      application: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>,
    ) => {
      const data = getData();
      const newApplication: JobApplication = {
        ...application,
        id: generateId(),
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.applications.push(newApplication);
      saveData(data);
      return newApplication;
    },
    update: (id: string, updates: Partial<JobApplication>) => {
      const data = getData();
      const index = data.applications.findIndex((a) => a.id === id);
      if (index !== -1) {
        data.applications[index] = {
          ...data.applications[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveData(data);
        return data.applications[index];
      }
      return null;
    },
  },

  // Certificates
  certificates: {
    findMany: () => getData().certificates,
    findByUserId: (userId: string) =>
      getData().certificates.filter((c) => c.userId === userId),
    count: () => getData().certificates.length,
    create: (certificate: Omit<Certificate, 'id' | 'issuedAt'>) => {
      const data = getData();
      const newCertificate: Certificate = {
        ...certificate,
        id: generateId(),
        issuedAt: new Date().toISOString(),
      };
      data.certificates.push(newCertificate);
      saveData(data);
      return newCertificate;
    },
  },

  // Utility to reset data
  reset: () => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  },
};
