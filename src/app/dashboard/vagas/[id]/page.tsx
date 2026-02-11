'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  MapPin,
  Home,
  Building,
  RefreshCcw,
  DollarSign,
  Clock,
  Send,
  CheckCircle,
  Building2,
  ChevronLeft,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { vagasService } from '@/lib/api/services/vagas.service';
import { candidaturasService } from '@/lib/api/services/candidaturas.service';
import { Vaga, Modalidade } from '@/lib/api';
import Link from 'next/link';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useAIMatch } from '@/hooks/useAIMatch';

const modalidadeConfig: Record<
  Modalidade | string,
  {
    label: string;
    icon: typeof Home;
  }
> = {
  remoto: {
    label: 'Remoto',
    icon: Home,
  },
  hibrido: {
    label: 'Híbrido',
    icon: RefreshCcw,
  },
  presencial: {
    label: 'Presencial',
    icon: Building,
  },
};

export default function VagaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  const [job, setJob] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const {
    matchResult,
    status: aiStatus,
    progress: aiProgress,
    runMatch,
    loadCachedMatch,
  } = useAIMatch();

  useEffect(() => {
    async function loadJob() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await vagasService.getById(id);
        setJob(data);

        if (user) {
          const myApps = await candidaturasService.getMinhas();
          const applied = myApps.some((app) => app.vagaId === id);
          setHasApplied(applied);

          // Load cached AI match result
          await loadCachedMatch(user.uid, id);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a vaga.',
          variant: 'destructive',
        });
        router.push('/dashboard/vagas');
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id, user, router, toast]);

  const handleApply = async () => {
    if (!job || !user) return;
    setApplying(true);
    try {
      await candidaturasService.apply(job.id);
      setHasApplied(true);
      toast({
        title: 'Sucesso!',
        description: 'Sua candidatura foi enviada.',
      });
    } catch (error: any) {
      // If error message says already applied
      if (error.message?.includes('já se candidatou')) {
        setHasApplied(true);
        toast({
          title: 'Info',
          description: 'Você já se candidatou para esta vaga.',
        });
      } else {
        console.error('Error applying:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao se candidatar. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className='p-6 space-y-6 max-w-4xl mx-auto'>
        <Skeleton className='h-8 w-1/3' />
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-1/2 mb-2' />
            <Skeleton className='h-4 w-1/4' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-32 w-full' />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) return null;

  const modalidade =
    modalidadeConfig[job.modalidade] || modalidadeConfig.hibrido;
  const ModalidadeIcon = modalidade.icon;

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <Button
        variant='ghost'
        className='pl-0 text-slate-500 hover:text-slate-900'
        onClick={() => router.back()}
      >
        <ChevronLeft className='h-4 w-4 mr-1' />
        Voltar para Vagas
      </Button>

      <Card className='bg-white border-slate-200 shadow-sm overflow-hidden'>
        <div className='h-2 bg-gradient-to-r from-blue-500 to-blue-600' />
        <CardHeader className='pb-4'>
          <div className='flex justify-between items-start gap-4'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <div className='h-16 w-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden'>
                  {job.empresa?.logoUrl ? (
                    <img
                      src={job.empresa.logoUrl}
                      alt={job.empresa.nome}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <Building2 className='h-8 w-8 text-slate-300' />
                  )}
                </div>
                <div>
                  <CardTitle className='text-3xl font-bold text-slate-900 mb-1'>
                    {job.titulo}
                  </CardTitle>
                  <div className='flex items-center gap-2 text-slate-500 text-lg'>
                    {job.empresa?.nome || 'Empresa Confidencial'}
                  </div>
                </div>
              </div>
            </div>
            {hasApplied ? (
              <div className='px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 font-semibold border border-emerald-100 shadow-sm'>
                <CheckCircle className='h-5 w-5' />
                Candidatura Enviada
              </div>
            ) : (
              <Button
                size='lg'
                className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-md px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95'
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Enviando...' : 'Candidatar-se Agora'}
                {!applying && <Send className='h-5 w-5 ml-2' />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-8'>
          {/* Meta Info */}
          <div className='flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100'>
            <div className='flex items-center gap-2 text-slate-600'>
              <MapPin className='h-4 w-4 text-rose-500' />
              {job.localizacao}
            </div>
            <div className='text-slate-300'>|</div>
            <div className='flex items-center gap-2 text-slate-600'>
              <ModalidadeIcon className='h-4 w-4 text-blue-500' />
              {modalidade.label}
            </div>
            {(job.salarioMin || job.salarioMax) && (
              <>
                <div className='text-slate-300'>|</div>
                <div className='flex items-center gap-2 text-slate-600'>
                  <DollarSign className='h-4 w-4 text-emerald-500' />
                  {job.salarioMin && job.salarioMax
                    ? `${job.salarioMin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - ${job.salarioMax.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : job.salarioMin
                      ? `A partir de ${job.salarioMin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                      : `Até ${job.salarioMax?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                </div>
              </>
            )}
            <div className='text-slate-300'>|</div>
            <div className='flex items-center gap-2 text-slate-600'>
              <Briefcase className='h-4 w-4 text-amber-500' />
              {job.tipoContrato.toUpperCase()}
            </div>
            <div className='text-slate-300 ml-auto'>|</div>
            <div className='flex items-center gap-2 text-slate-500 text-sm'>
              <Clock className='h-3 w-3' />
              Publicada em{' '}
              {new Date(
                job.dataPublicacao || job.createdAt,
              ).toLocaleDateString()}
            </div>
          </div>

          {/* Content */}
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='md:col-span-2 space-y-8'>
              <section className='prose prose-slate max-w-none'>
                <h3 className='text-xl font-bold text-slate-900 mb-4 flex items-center gap-2'>
                  Sobre a Vaga
                </h3>
                <div className='text-slate-600 leading- relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100'>
                  {job.descricao}
                </div>
              </section>

              <section>
                <h3 className='text-xl font-bold text-slate-900 mb-4 flex items-center gap-2'>
                  Requisitos
                </h3>
                <div className='bg-white rounded-2xl border border-slate-200 p-6 shadow-sm'>
                  <ul className='space-y-3'>
                    {job.requisitos.map((req, i) => (
                      <li
                        key={i}
                        className='flex items-start gap-3 text-slate-600'
                      >
                        <div className='mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-500/50' />
                        <span className='leading-relaxed'>{req.descricao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            <div className='space-y-6'>
              {/* AI Match Card */}
              <Card className='bg-white border-slate-200 shadow-sm overflow-hidden'>
                <CardHeader className='bg-gradient-to-r from-purple-50 to-indigo-50 pb-3 border-b border-slate-100'>
                  <CardTitle className='text-base font-bold text-slate-900 flex items-center gap-2'>
                    <Brain className='h-5 w-5 text-purple-600' />
                    Análise de Compatibilidade IA
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-5'>
                  {aiStatus === 'idle' && !matchResult && (
                    <div className='text-center space-y-3'>
                      <div className='inline-flex p-4 rounded-full bg-purple-50'>
                        <Sparkles className='h-8 w-8 text-purple-400' />
                      </div>
                      <p className='text-slate-500 text-sm'>
                        Use IA para analisar sua compatibilidade com esta vaga
                      </p>
                      <Button
                        onClick={() => user && runMatch(user.uid, job)}
                        disabled={!user}
                        className='w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20'
                      >
                        <Brain className='h-4 w-4 mr-2' />
                        Analisar Compatibilidade
                      </Button>
                      <p className='text-xs text-slate-400'>
                        Modelo roda no seu navegador via WebGPU
                      </p>
                    </div>
                  )}

                  {(aiStatus === 'loading-model' ||
                    aiStatus === 'analyzing') && (
                    <div className='text-center space-y-3 py-4'>
                      <Loader2 className='h-10 w-10 text-purple-500 animate-spin mx-auto' />
                      <p className='text-sm text-slate-600 font-medium'>
                        {aiStatus === 'loading-model'
                          ? 'Carregando modelo de IA...'
                          : 'Analisando compatibilidade...'}
                      </p>
                      <p className='text-xs text-slate-400 max-w-[250px] mx-auto'>
                        {aiProgress}
                      </p>
                    </div>
                  )}

                  {aiStatus === 'no-webgpu' && (
                    <div className='text-center space-y-2 py-2'>
                      <AlertTriangle className='h-8 w-8 text-amber-500 mx-auto' />
                      <p className='text-sm text-slate-600'>
                        WebGPU não suportado
                      </p>
                      <p className='text-xs text-slate-400'>
                        Use Chrome 113+ ou Edge 113+
                      </p>
                    </div>
                  )}

                  {aiStatus === 'error' && (
                    <div className='text-center space-y-3 py-2'>
                      <AlertTriangle className='h-8 w-8 text-red-400 mx-auto' />
                      <p className='text-sm text-red-600'>{aiProgress}</p>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => user && runMatch(user.uid, job)}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  )}

                  {aiStatus === 'done' && matchResult && (
                    <div className='space-y-4'>
                      {/* Score */}
                      <div className='flex items-center gap-4'>
                        <div className='relative h-20 w-20 shrink-0'>
                          <svg
                            viewBox='0 0 36 36'
                            className='h-20 w-20 -rotate-90'
                          >
                            <path
                              d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                              fill='none'
                              stroke='#e2e8f0'
                              strokeWidth='3'
                            />
                            <path
                              d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                              fill='none'
                              stroke={
                                matchResult.matchScore >= 75
                                  ? '#22c55e'
                                  : matchResult.matchScore >= 50
                                    ? '#f59e0b'
                                    : '#ef4444'
                              }
                              strokeWidth='3'
                              strokeDasharray={`${matchResult.matchScore}, 100`}
                              strokeLinecap='round'
                            />
                          </svg>
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-xl font-bold text-slate-900'>
                              {matchResult.matchScore}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className='font-bold text-slate-900 text-lg'>
                            Match{' '}
                            {matchResult.recomendacao === 'forte'
                              ? 'Forte'
                              : matchResult.recomendacao === 'medio'
                                ? 'Médio'
                                : 'Fraco'}
                          </p>
                          <p className='text-xs text-slate-400'>
                            via {matchResult.model}
                          </p>
                        </div>
                      </div>

                      {/* Strengths */}
                      {matchResult.motivosMatch.length > 0 && (
                        <div>
                          <p className='text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1'>
                            <TrendingUp className='h-3 w-3' /> Pontos Fortes
                          </p>
                          <ul className='space-y-1'>
                            {matchResult.motivosMatch
                              .slice(0, 3)
                              .map((m, i) => (
                                <li
                                  key={i}
                                  className='text-xs text-slate-600 flex items-start gap-1.5'
                                >
                                  <span className='text-emerald-500 mt-0.5'>
                                    ✓
                                  </span>{' '}
                                  {m}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Gaps */}
                      {matchResult.gaps.length > 0 && (
                        <div>
                          <p className='text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1'>
                            <AlertTriangle className='h-3 w-3' /> Gaps
                          </p>
                          <ul className='space-y-1'>
                            {matchResult.gaps.slice(0, 3).map((g, i) => (
                              <li
                                key={i}
                                className='text-xs text-slate-600 flex items-start gap-1.5'
                              >
                                <span className='text-amber-500 mt-0.5'>!</span>{' '}
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggestions */}
                      {matchResult.sugestoesMelhorarCurriculo.length > 0 && (
                        <div>
                          <p className='text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1'>
                            <Lightbulb className='h-3 w-3' /> Sugestões
                          </p>
                          <ul className='space-y-1'>
                            {matchResult.sugestoesMelhorarCurriculo
                              .slice(0, 2)
                              .map((s, i) => (
                                <li
                                  key={i}
                                  className='text-xs text-slate-600 flex items-start gap-1.5'
                                >
                                  <span className='text-blue-500 mt-0.5'>
                                    💡
                                  </span>{' '}
                                  {s}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full mt-2 text-xs'
                        onClick={() => user && runMatch(user.uid, job)}
                      >
                        <RefreshCcw className='h-3 w-3 mr-1' />
                        Reanalisar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {job.beneficios && job.beneficios.length > 0 && (
                <Card className='bg-white border-slate-200 shadow-sm overflow-hidden'>
                  <CardHeader className='bg-slate-50 pb-3 border-b border-slate-100'>
                    <CardTitle className='text-base font-bold text-slate-900 flex items-center gap-2'>
                      Benefícios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-0'>
                    <ul className='divide-y divide-slate-100'>
                      {job.beneficios.map((b, i) => (
                        <li
                          key={i}
                          className='flex items-center gap-3 p-4 text-sm text-slate-600 hover:bg-slate-50 transition-colors'
                        >
                          <div className='h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0'>
                            <CheckCircle className='h-4 w-4 text-emerald-600' />
                          </div>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className='bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white shadow-lg overflow-hidden relative'>
                <div className='absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16' />
                <div className='absolute bottom-0 left-0 p-12 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16' />
                <CardContent className='p-6 relative z-10'>
                  <div className='h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4'>
                    <Briefcase className='h-6 w-6 text-white' />
                  </div>
                  <h4 className='font-bold text-lg mb-2'>Dica do Recrutador</h4>
                  <p className='text-blue-100 text-sm leading-relaxed mb-4'>
                    Mantenha seu perfil atualizado com suas últimas experiências
                    e habilidades. Perfis completos têm 3x mais chances de serem
                    selecionados.
                  </p>
                  <Link
                    href='/dashboard/perfil'
                    className='inline-flex items-center justify-center w-full py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm shadow-sm'
                  >
                    Editar Perfil
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
