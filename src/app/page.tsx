import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GraduationCap,
  Briefcase,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    title: 'Cursos Online',
    description: 'Acesse cursos de qualidade para impulsionar sua carreira',
    icon: GraduationCap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Vagas de Emprego',
    description: 'Encontre oportunidades alinhadas ao seu perfil',
    icon: Briefcase,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Certificados',
    description: 'Conquiste certificados reconhecidos pelo mercado',
    icon: Award,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Acompanhamento',
    description: 'Monitore seu progresso e evolução profissional',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50'>
      {/* Header */}
      <header className='border-b border-slate-200 bg-white/70 backdrop-blur-lg sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <Link href='/' className='text-2xl font-bold flex items-center gap-2'>
            <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <span className='bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
              Web Skill First
            </span>
          </Link>
          <nav className='flex items-center gap-4 w-full sm:w-auto justify-center'>
            {session ? (
              <Link href='/dashboard'>
                <Button className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'>
                  Dashboard
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </Link>
            ) : (
              <Link href='/login'>
                <Button className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'>
                  Entrar
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-24 text-center'>
        <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium mb-8'>
          <Sparkles className='h-4 w-4' />
          Plataforma de Desenvolvimento Profissional
        </div>
        <h1 className='text-4xl md:text-6xl font-bold text-slate-900 mb-6'>
          Sua jornada para o{' '}
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400'>
            sucesso
          </span>{' '}
          começa aqui
        </h1>
        <p className='text-xl text-slate-600 mb-8 max-w-2xl mx-auto'>
          Plataforma completa para desenvolvimento profissional com cursos,
          vagas de emprego e certificações.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href={session ? '/dashboard' : '/login'}
            className='w-full sm:w-auto'
          >
            <Button
              size='lg'
              className='w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
            >
              {session ? 'Acessar Dashboard' : 'Começar Agora'}
              <ChevronRight className='h-4 w-4 ml-2' />
            </Button>
          </Link>
          <Link href='/cursos' className='w-full sm:w-auto'>
            <Button
              size='lg'
              variant='outline'
              className='w-full border-slate-200 text-slate-700 hover:bg-slate-100'
            >
              Ver Cursos
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-4 py-16'>
        <h2 className='text-3xl font-bold text-slate-900 text-center mb-4'>
          Tudo que você precisa em um só lugar
        </h2>
        <p className='text-slate-600 text-center mb-12 max-w-xl mx-auto'>
          Todas as ferramentas para impulsionar sua carreira profissional
        </p>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className='bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm group'
              >
                <CardHeader>
                  <div
                    className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-2 w-fit`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className='text-slate-900 group-hover:text-blue-600 transition-colors'>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-slate-500'>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-slate-200 mt-16 bg-white'>
        <div className='container mx-auto px-4 py-8 text-center text-slate-500'>
          <p>© 2024 Web Skill First. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
