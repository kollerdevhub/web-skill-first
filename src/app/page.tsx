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
  BrainCircuit,
  FileText,
  Target,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';
import { LandingHero } from '@/components/landing-hero';
import { ScrollToTop } from '@/components/scroll-to-top';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className='min-h-screen bg-[#fafbfc]'>
      <ScrollToTop />
      <LandingHeader />
      <LandingHero />

      {/* Features Grid */}
      <section className='container mx-auto px-4 py-20'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl font-bold text-slate-900 mb-4'>
            Por que escolher a Web Skill First?
          </h2>
          <p className='text-slate-600 max-w-2xl mx-auto'>
            Nossa plataforma combina inteligência artificial e gamificação para
            acelerar sua carreira.
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          <Card className='bg-white border-slate-200 hover:shadow-lg transition-all'>
            <CardHeader>
              <div className='w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4'>
                <BrainCircuit className='h-6 w-6 text-purple-600' />
              </div>
              <CardTitle className='text-xl'>Match com IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-base'>
                Nossa IA analisa seu perfil e sugere as vagas ideais,
                economizando seu tempo e aumentando suas chances.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='bg-white border-slate-200 hover:shadow-lg transition-all'>
            <CardHeader>
              <div className='w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4'>
                <FileText className='h-6 w-6 text-blue-600' />
              </div>
              <CardTitle className='text-xl'>Análise de Currículo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-base'>
                Faça upload do seu PDF e nossa IA extrai automaticamente suas
                habilidades e experiências em segundos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='bg-white border-slate-200 hover:shadow-lg transition-all'>
            <CardHeader>
              <div className='w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4'>
                <Target className='h-6 w-6 text-orange-600' />
              </div>
              <CardTitle className='text-xl'>Gamificação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-base'>
                Ganhe XP, suba de nível e conquiste badges completando cursos e
                desafios. Torne seu aprendizado viciante.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className='bg-slate-900 py-20 text-white'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-16'>
            Como funciona sua jornada
          </h2>

          <div className='grid md:grid-cols-4 gap-8 relative'>
            <div className='text-center relative z-10'>
              <div className='w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-blue-900/50'>
                1
              </div>
              <h3 className='text-xl font-semibold mb-3'>Crie seu Perfil</h3>
              <p className='text-slate-400'>
                Cadastre-se e envie seu currículo para análise automática.
              </p>
            </div>

            <div className='text-center relative z-10'>
              <div className='w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-6 text-xl font-bold'>
                2
              </div>
              <h3 className='text-xl font-semibold mb-3'>Descubra Vagas</h3>
              <p className='text-slate-400'>
                Receba recomendações personalizadas baseadas no seu perfil.
              </p>
            </div>

            <div className='text-center relative z-10'>
              <div className='w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-6 text-xl font-bold'>
                3
              </div>
              <h3 className='text-xl font-semibold mb-3'>Evolua Skills</h3>
              <p className='text-slate-400'>
                Faça cursos sugeridos para preencher lacunas no seu currículo.
              </p>
            </div>

            <div className='text-center relative z-10'>
              <div className='w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-green-900/50'>
                4
              </div>
              <h3 className='text-xl font-semibold mb-3'>Conquiste</h3>
              <p className='text-slate-400'>
                Candidate-se com confiança e conquiste sua próxima vaga.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className='py-20 bg-white border-b border-slate-100'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            <div>
              <div className='text-4xl font-bold text-blue-600 mb-2'>2k+</div>
              <div className='text-slate-600 font-medium'>Alunos Ativos</div>
            </div>
            <div>
              <div className='text-4xl font-bold text-blue-600 mb-2'>500+</div>
              <div className='text-slate-600 font-medium'>Vagas Abertas</div>
            </div>
            <div>
              <div className='text-4xl font-bold text-blue-600 mb-2'>150+</div>
              <div className='text-slate-600 font-medium'>
                Empresas Parceiras
              </div>
            </div>
            <div>
              <div className='text-4xl font-bold text-blue-600 mb-2'>98%</div>
              <div className='text-slate-600 font-medium'>Taxa de Match</div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Preview */}
      <section className='container mx-auto px-4 py-20'>
        <div className='flex flex-col md:flex-row justify-between items-center mb-10'>
          <div>
            <h2 className='text-3xl font-bold text-slate-900 mb-2'>
              Cursos em Destaque
            </h2>
            <p className='text-slate-600'>Comece a aprender agora mesmo</p>
          </div>
          <Link href='/cursos'>
            <Button variant='ghost' className='text-blue-600'>
              Ver todos os cursos <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </Link>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          {[
            {
              title: 'React Completo',
              students: 120,
              level: 'Iniciante',
              image: 'bg-blue-100',
            },
            {
              title: 'Node.js Avançado',
              students: 85,
              level: 'Avançado',
              image: 'bg-green-100',
            },
            {
              title: 'UX/UI Design',
              students: 200,
              level: 'Intermediário',
              image: 'bg-purple-100',
            },
          ].map((course, i) => (
            <div key={i} className='group cursor-pointer'>
              <div
                className={`h-40 rounded-xl ${course.image} mb-4 flex items-center justify-center text-slate-400`}
              >
                <TrendingUp className='h-10 w-10 opacity-50' />
              </div>
              <h3 className='font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors'>
                {course.title}
              </h3>
              <div className='flex items-center gap-4 mt-2 text-sm text-slate-500'>
                <span className='flex items-center gap-1'>
                  <Users className='h-4 w-4' /> {course.students} alunos
                </span>
                <span className='flex items-center gap-1'>
                  <Award className='h-4 w-4' /> {course.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className='container mx-auto px-4 pb-20'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white relative overflow-hidden'>
          <div className='relative z-10'>
            <h2 className='text-3xl md:text-4xl font-bold mb-6'>
              Pronto para transformar sua carreira?
            </h2>
            <p className='text-blue-100 text-lg mb-8 max-w-2xl mx-auto'>
              Junte-se a milhares de profissionais que já estão usando a Web
              Skill First para alcançar seus objetivos.
            </p>
            <Link href='/login'>
              <Button
                size='lg'
                className='bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg h-auto'
              >
                <Zap className='h-5 w-5 mr-2 fill-current' /> Começar
                Gratuitamente
              </Button>
            </Link>
          </div>
          {/* Decorative background elements */}
          <div className='absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2' />
          <div className='absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2' />
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-slate-200 bg-white'>
        <div className='container mx-auto px-4 py-8 text-center text-slate-500 text-sm'>
          <p>© 2026 Web Skill First. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
