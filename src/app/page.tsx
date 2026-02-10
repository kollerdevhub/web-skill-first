import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GraduationCap, Briefcase, Award, TrendingUp } from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';
import { LandingHero } from '@/components/landing-hero';

const features = [
  {
    title: 'Cursos Online',
    description: 'Acesse cursos de qualidade para impulsionar sua carreira',
    icon: GraduationCap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Vagas de Emprego',
    description: 'Encontre oportunidades alinhadas ao seu perfil',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Certificados',
    description: 'Conquiste certificados reconhecidos pelo mercado',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Acompanhamento',
    description: 'Monitore seu progresso e evolução profissional',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
];

export default function Home() {
  return (
    <div className='min-h-screen bg-[#fafbfc]'>
      <LandingHeader />
      <LandingHero />

      {/* Features Section */}
      <section className='container mx-auto px-4 py-20 bg-white border-y border-slate-200/80'>
        <h2 className='text-2xl md:text-3xl font-bold text-slate-900 text-center mb-3'>
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
                className='bg-white border-slate-200 hover:border-blue-200 hover:shadow-md transition-all shadow-sm group'
              >
                <CardHeader>
                  <div
                    className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-2 w-fit border border-blue-100/50`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className='text-slate-900 group-hover:text-blue-600 transition-colors text-base'>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-slate-500 text-sm'>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
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
