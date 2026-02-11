'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  Home,
  Building,
  RefreshCcw,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import CurrencyInput from 'react-currency-input-field';
import { vagasService } from '@/lib/api/services/vagas.service';
import { empresasService } from '@/lib/api/services/empresas.service';
import { useToast } from '@/hooks/use-toast';
import {
  Vaga,
  CreateVagaDTO,
  Modalidade,
  TipoContrato,
  VagaStatus,
  Empresa,
} from '@/lib/api/types';

const statusConfig: Record<
  VagaStatus | string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof CheckCircle;
  }
> = {
  aberta: {
    label: 'Aberta',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle,
  },
  rascunho: {
    label: 'Rascunho',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: Clock,
  },
  pausada: {
    label: 'Pausada',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  fechada: {
    label: 'Fechada',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: XCircle,
  },
  cancelada: {
    label: 'Cancelada',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    icon: XCircle,
  },
  // Legacy mappings if needed
  active: {
    label: 'Ativa',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle,
  },
  inactive: {
    label: 'Inativa',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
  closed: {
    label: 'Encerrada',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: Clock,
  },
};

const typeConfig: Record<
  Modalidade | string,
  { label: string; icon: typeof Home }
> = {
  remoto: { label: 'Remoto', icon: Home },
  hibrido: { label: 'Híbrido', icon: RefreshCcw },
  presencial: { label: 'Presencial', icon: Building },
  // Legacy
  remote: { label: 'Remoto', icon: Home },
  hybrid: { label: 'Híbrido', icon: RefreshCcw },
  onsite: { label: 'Presencial', icon: Building },
};

export default function AdminVagasPage() {
  const [jobs, setJobs] = useState<Vaga[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Vaga | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobToDelete, setJobToDelete] = useState<Vaga | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Stats
  const [applicationsCount, setApplicationsCount] = useState<
    Record<string, number>
  >({});

  const [formData, setFormData] = useState<
    CreateVagaDTO & { empresaNome?: string }
  >({
    titulo: '',
    empresaId: '',
    descricao: `**Sobre a posição**

Estamos buscando um(a) [Cargo] para atuar no desenvolvimento e na evolução de soluções escaláveis, seguras e de alta performance. Você fará parte de um time multidisciplinar, colaborando com engenheiros, designers e gerentes de produto para criar experiências de alto impacto para nossos usuários.

**Responsabilidades**

- Projetar, desenvolver e manter aplicações robustas e escaláveis.
- Liderar decisões técnicas, propondo arquiteturas e boas práticas.
- Realizar revisões de código, garantindo qualidade e consistência.
- Colaborar com times de Produto, QA e Design para entregar valor contínuo.
- Identificar gargalos de performance e implementar melhorias.
- Orientar e apoiar engenheiros de níveis júnior e pleno.
- Participar do ciclo completo de desenvolvimento, do planejamento ao deploy.
- Escrever documentação técnica clara e atualizada.

**Diferenciais**

- Experiência com arquitetura em nuvem (AWS, GCP ou Azure).
- Conhecimento em observabilidade (Prometheus, Grafana, OpenTelemetry).
- Experiência com sistemas de alta escala ou tráfego elevado.
- Participação ativa em comunidades, open source ou eventos técnicos.`,
    requisitos: [],
    localizacao: '',
    tipoContrato: 'clt',
    modalidade: 'hibrido',
    salarioMin: 0,
    salarioMax: 0,
    beneficios: [],
    testeObrigatorio: false,
  });

  // Helper to handle array inputs from textareas
  const [requirementsText, setRequirementsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [isManualCompany, setIsManualCompany] = useState(false);

  // AI generation state
  const aiEngineRef = useRef<any>(null);
  const [aiStatus, setAiStatus] = useState<
    'idle' | 'loading' | 'generating' | 'done' | 'error'
  >('idle');
  const [aiProgress, setAiProgress] = useState('');

  const generateWithAI = useCallback(async () => {
    if (!formData.titulo.trim()) {
      toast({
        title: 'Informe o título',
        description: 'Digite o título da vaga antes de gerar com IA.',
        variant: 'destructive',
      });
      return;
    }

    if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
      toast({
        title: 'WebGPU não disponível',
        description: 'Seu navegador não suporta WebGPU. Use Chrome 113+.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAiStatus('loading');
      setAiProgress('Carregando modelo de IA...');

      const webllm = await import('@mlc-ai/web-llm');
      const selectedModel = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

      if (!aiEngineRef.current) {
        const engine = await webllm.CreateMLCEngine(selectedModel, {
          initProgressCallback: (report: any) => {
            const pct = Math.round(report.progress * 100);
            setAiProgress(`Baixando modelo (${pct}%)...`);
          },
        });
        aiEngineRef.current = engine;
      }

      setAiStatus('generating');
      setAiProgress('Gerando descrição da vaga...');

      const modalidadeLabel =
        formData.modalidade === 'remoto'
          ? 'remoto'
          : formData.modalidade === 'hibrido'
            ? 'híbrido'
            : 'presencial';
      const contratoLabel =
        formData.tipoContrato === 'clt'
          ? 'CLT'
          : formData.tipoContrato === 'pj'
            ? 'PJ'
            : formData.tipoContrato === 'estagio'
              ? 'Estágio'
              : 'Temporário';

      const prompt = `You are a professional HR recruiter. Create a job posting for:
Title: ${formData.titulo}
Type: ${modalidadeLabel}
Contract: ${contratoLabel}
${formData.localizacao ? `Location: ${formData.localizacao}` : ''}

Output strictly valid JSON with this structure:
{
  "descricao": "Markdwon text with sections: **Sobre a posição**, **Responsabilidades**, **Diferenciais**",
  "requisitos": ["req 1", "req 2", "req 3", "req 4", "req 5"],
  "beneficios": ["ben 1", "ben 2", "ben 3", "ben 4", "ben 5"]
}

Example output:
{
  "descricao": "**Sobre a posição**\\nBuscamos um desenvolvedor...\\n\\n**Responsabilidades**\\n- Desenvolver código...\\n\\n**Diferenciais**\\n- Conhecimento em...",
  "requisitos": ["Experiência com React", "Node.js avançado"],
  "beneficios": ["Vale Refeição", "Plano de Saúde"]
}

Reply ONLY with the JSON object.`;

      const response = await aiEngineRef.current.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful HR assistant. You output ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const content = response.choices[0]?.message?.content || '';
      let parsed: any = null;

      // Try to parse JSON from response
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            /* ignore */
          }
        }
      }

      if (parsed) {
        if (parsed.descricao && typeof parsed.descricao === 'string') {
          setFormData((prev) => ({ ...prev, descricao: parsed.descricao }));
        }
        if (Array.isArray(parsed.requisitos) && parsed.requisitos.length > 0) {
          setRequirementsText(parsed.requisitos.join('\n'));
        }
        if (Array.isArray(parsed.beneficios) && parsed.beneficios.length > 0) {
          setBenefitsText(parsed.beneficios.join('\n'));
        }
        setAiStatus('done');
        setAiProgress('Conteúdo gerado com sucesso!');
        toast({
          title: 'Vaga gerada!',
          description:
            'Descrição, requisitos e benefícios preenchidos. Revise e ajuste conforme necessário.',
        });
      } else {
        // Fallback: try to extract sections from markdown text
        if (content.length > 50) {
          let description = content;
          const reqs: string[] = [];
          const bens: string[] = [];

          // Try to find Requirements section
          const reqMatch = content.match(
            /(?:Requisitos|Requirements|Qualifications)(?:[:\n])([\s\S]*?)(?=(?:Benefícios|Benefits|Differentials|Diferenciais|Sobre|$))/i,
          );
          if (reqMatch && reqMatch[1]) {
            reqMatch[1].split('\n').forEach((line: string) => {
              const cleaned = line.replace(/^[\s-•*]+/, '').trim();
              if (cleaned.length > 5) reqs.push(cleaned);
            });
            // Remove requirements from description to avoid duplication
            description = description.replace(reqMatch[0], '');
          }

          // Try to find Benefits section
          const benMatch = content.match(
            /(?:Benefícios|Benefits)(?:[:\n])([\s\S]*?)(?=(?:$))/i,
          );
          if (benMatch && benMatch[1]) {
            benMatch[1].split('\n').forEach((line: string) => {
              const cleaned = line.replace(/^[\s-•*]+/, '').trim();
              if (cleaned.length > 5) bens.push(cleaned);
            });
            // Remove benefits from description
            description = description.replace(benMatch[0], '');
          }

          setFormData((prev) => ({ ...prev, descricao: description.trim() }));
          if (reqs.length > 0) setRequirementsText(reqs.join('\n'));
          if (bens.length > 0) setBenefitsText(bens.join('\n'));

          setAiStatus('done');
          setAiProgress('Conteúdo gerado (formato adaptado).');
          toast({
            title: 'Conteúdo adaptado',
            description:
              'A IA não retornou o formato padrão, mas tentamos extrair as informações.',
            variant: 'default',
          });
        } else {
          throw new Error('Resposta da IA insuficiente');
        }
      }

      setTimeout(() => setAiStatus('idle'), 5000);
    } catch (error: any) {
      console.error('AI generation error:', error);
      setAiStatus('error');
      setAiProgress(error.message || 'Erro ao gerar com IA');
      setTimeout(() => setAiStatus('idle'), 4000);
    }
  }, [
    formData.titulo,
    formData.modalidade,
    formData.tipoContrato,
    formData.localizacao,
    toast,
  ]);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await empresasService.list();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await vagasService.search({ limit: 100 });
      setJobs(response.data);

      // Fetch application counts
      const counts: Record<string, number> = {};
      for (const job of response.data) {
        try {
          const count = await vagasService.getCandidaturasCount(job.id);
          counts[job.id] = count.total;
        } catch (e) {
          console.error(e);
        }
      }
      setApplicationsCount(counts);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Prepare data
    const payload: CreateVagaDTO = {
      ...formData,
      empresaId: isManualCompany ? undefined : formData.empresaId,
      empresaNome: isManualCompany ? formData.empresaNome : undefined,
      requisitos: requirementsText
        .split('\n')
        .filter(Boolean)
        .map((r) => ({ tipo: 'obrigatorio', descricao: r })),
      beneficios: benefitsText.split('\n').filter(Boolean),
    };

    try {
      if (editingJob) {
        await vagasService.update(editingJob.id, payload);
      } else {
        await vagasService.create(payload);
      }

      fetchJobs();
      setDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: editingJob
          ? 'Vaga atualizada com sucesso'
          : 'Vaga criada com sucesso',
      });
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar vaga. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    job: Vaga,
    action: 'publish' | 'pause' | 'resume' | 'close',
  ) => {
    setSaving(true);
    try {
      let updatedJob: Vaga;
      switch (action) {
        case 'publish':
          updatedJob = await vagasService.publish(job.id);
          toast({
            title: 'Vaga publicada',
            description: 'A vaga agora está visível para candidatos.',
          });
          break;
        case 'pause':
          updatedJob = await vagasService.pause(job.id);
          toast({
            title: 'Vaga pausada',
            description: 'A vaga não receberá novas candidaturas.',
          });
          break;
        case 'resume':
          updatedJob = await vagasService.resume(job.id);
          toast({
            title: 'Vaga reaberta',
            description: 'A vaga está aceitando candidaturas novamente.',
          });
          break;
        case 'close':
          updatedJob = await vagasService.close(job.id);
          toast({
            title: 'Vaga encerrada',
            description: 'Processo seletivo finalizado.',
          });
          break;
      }
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, status: updatedJob.status } : j,
        ),
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (job: Vaga) => {
    setEditingJob(job);
    setFormData({
      titulo: job.titulo,
      empresaId: job.empresaId,
      descricao: job.descricao,
      requisitos: job.requisitos,
      localizacao: job.localizacao,
      tipoContrato: job.tipoContrato,
      modalidade: job.modalidade,
      salarioMin: job.salarioMin,
      salarioMax: job.salarioMax,
      beneficios: job.beneficios,
      testeObrigatorio: job.testeObrigatorio,
    });
    setRequirementsText(job.requisitos.map((r) => r.descricao).join('\n'));
    setBenefitsText(job.beneficios.join('\n'));

    // Check if it's a manual company
    if (!job.empresaId && job.empresaNome) {
      setIsManualCompany(true);
      setFormData((prev) => ({ ...prev, empresaNome: job.empresaNome }));
    } else {
      setIsManualCompany(false);
    }

    setDialogOpen(true);
  };

  const confirmDelete = (job: Vaga) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!jobToDelete) return;
    try {
      await vagasService.delete(jobToDelete.id);
      setJobs(jobs.filter((j) => j.id !== jobToDelete.id));
      toast({
        title: 'Vaga excluída',
        description: `A vaga "${jobToDelete.titulo}" foi removida.`,
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir vaga.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      titulo: '',
      empresaId: '',
      descricao: `**Sobre a posição**

Estamos buscando um(a) [Cargo] para atuar no desenvolvimento e na evolução de soluções escaláveis, seguras e de alta performance. Você fará parte de um time multidisciplinar, colaborando com engenheiros, designers e gerentes de produto para criar experiências de alto impacto para nossos usuários.

**Responsabilidades**

- Projetar, desenvolver e manter aplicações robustas e escaláveis.
- Liderar decisões técnicas, propondo arquiteturas e boas práticas.
- Realizar revisões de código, garantindo qualidade e consistência.
- Colaborar com times de Produto, QA e Design para entregar valor contínuo.
- Identificar gargalos de performance e implementar melhorias.
- Orientar e apoiar engenheiros de níveis júnior e pleno.
- Participar do ciclo completo de desenvolvimento, do planejamento ao deploy.
- Escrever documentação técnica clara e atualizada.

**Diferenciais**

- Experiência com arquitetura em nuvem (AWS, GCP ou Azure).
- Conhecimento em observabilidade (Prometheus, Grafana, OpenTelemetry).
- Experiência com sistemas de alta escala ou tráfego elevado.
- Participação ativa em comunidades, open source ou eventos técnicos.`,
      requisitos: [],
      localizacao: '',
      tipoContrato: 'clt',
      modalidade: 'hibrido',
      salarioMin: 0,
      salarioMax: 0,
      beneficios: [],
      testeObrigatorio: false,
    });
    setRequirementsText('');
    setBenefitsText('');
    setIsManualCompany(false);
  };

  const stats = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter((j) => j.status === 'aberta').length,
      applications: Object.values(applicationsCount).reduce((a, b) => a + b, 0),
    }),
    [jobs, applicationsCount],
  );

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (job.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.empresa?.nome
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) &&
          (statusFilter === 'all' || job.status === statusFilter),
      ),
    [jobs, searchTerm, statusFilter],
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
            <Briefcase className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>Vagas</h1>
            <p className='text-muted-foreground text-sm'>
              Gerencie as vagas de emprego
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
            >
              <Plus className='h-4 w-4 mr-2' />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='text-slate-900 flex items-center gap-2'>
                <Briefcase className='h-5 w-5 text-blue-500' />
                {editingJob ? 'Editar Vaga' : 'Nova Vaga'}
              </DialogTitle>
              <DialogDescription className='text-slate-500'>
                Preencha os dados da vaga
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Título *</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    className='border-slate-200'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label>Empresa *</Label>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-auto p-0 text-xs text-blue-600 hover:text-blue-700'
                      onClick={() => {
                        setIsManualCompany(!isManualCompany);
                        setFormData((prev) => ({
                          ...prev,
                          empresaId: '',
                          empresaNome: '',
                        }));
                      }}
                    >
                      {isManualCompany
                        ? 'Selecionar existente'
                        : 'Digitar nome manual'}
                    </Button>
                  </div>

                  {isManualCompany ? (
                    <Input
                      value={formData.empresaNome || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          empresaNome: e.target.value,
                        })
                      }
                      placeholder='Digite o nome da empresa'
                      className='border-slate-200'
                      required
                    />
                  ) : (
                    <Select
                      value={formData.empresaId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, empresaId: v })
                      }
                    >
                      <SelectTrigger className='border-slate-200'>
                        <SelectValue placeholder='Selecione a empresa' />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Modalidade</Label>
                  <Select
                    value={formData.modalidade}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, modalidade: v })
                    }
                  >
                    <SelectTrigger className='border-slate-200'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='remoto'>Remoto</SelectItem>
                      <SelectItem value='hibrido'>Híbrido</SelectItem>
                      <SelectItem value='presencial'>Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Localização</Label>
                  <Input
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    className='border-slate-200'
                  />
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>Contrato</Label>
                  <Select
                    value={formData.tipoContrato}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, tipoContrato: v })
                    }
                  >
                    <SelectTrigger className='border-slate-200'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='clt'>CLT</SelectItem>
                      <SelectItem value='pj'>PJ</SelectItem>
                      <SelectItem value='estagio'>Estágio</SelectItem>
                      <SelectItem value='temporario'>Temporário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Salário Mín</Label>
                  <CurrencyInput
                    id='salarioMin'
                    name='salarioMin'
                    placeholder='R$ 0,00'
                    defaultValue={formData.salarioMin}
                    decimalsLimit={2}
                    onValueChange={(value) => {
                      const num = value ? Number(value.replace(',', '.')) : 0;
                      setFormData({ ...formData, salarioMin: num });
                    }}
                    prefix='R$ '
                    groupSeparator='.'
                    decimalSeparator=','
                    className='flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Salário Máx</Label>
                  <CurrencyInput
                    id='salarioMax'
                    name='salarioMax'
                    placeholder='R$ 0,00'
                    defaultValue={formData.salarioMax}
                    decimalsLimit={2}
                    onValueChange={(value) => {
                      const num = value ? Number(value.replace(',', '.')) : 0;
                      setFormData({ ...formData, salarioMax: num });
                    }}
                    prefix='R$ '
                    groupSeparator='.'
                    decimalSeparator=','
                    className='flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  />
                </div>
              </div>

              {/* AI Generate Button */}
              <div className='rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-purple-800 flex items-center gap-1.5'>
                      <Sparkles className='h-4 w-4 shrink-0' />
                      Assistente IA
                    </p>
                    <p className='text-xs text-purple-600 mt-0.5'>
                      {aiStatus === 'idle'
                        ? 'Gere descrição, requisitos e benefícios automaticamente a partir do título'
                        : aiProgress}
                    </p>
                  </div>
                  <Button
                    type='button'
                    disabled={
                      aiStatus === 'loading' || aiStatus === 'generating'
                    }
                    onClick={generateWithAI}
                    className={`shrink-0 ${
                      aiStatus === 'done'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white shadow-md`}
                  >
                    {aiStatus === 'loading' || aiStatus === 'generating' ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Gerando...
                      </>
                    ) : aiStatus === 'done' ? (
                      <>
                        <CheckCircle className='h-4 w-4 mr-2' />
                        Gerado!
                      </>
                    ) : (
                      <>
                        <Sparkles className='h-4 w-4 mr-2' />
                        Gerar com IA
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Descrição *</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className='border-slate-200 min-h-[100px]'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label>Requisitos (um por linha) *</Label>
                <Textarea
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  className='border-slate-200 min-h-[80px]'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label>Benefícios (um por linha)</Label>
                <Textarea
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className='border-slate-200 min-h-[60px]'
                />
              </div>
              <div className='flex justify-end gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={saving}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  {saving ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : null}
                  {editingJob ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Excluir vaga?</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a vaga &quot;
                {jobToDelete?.titulo}&quot;? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant='destructive' onClick={handleExecuteDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Card className='bg-card border-border shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.total}
                </p>
                <p className='text-sm text-muted-foreground'>Total</p>
              </div>
              <div className='p-3 rounded-xl bg-blue-500/10'>
                <Briefcase className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.active}
                </p>
                <p className='text-sm text-muted-foreground'>Abertas</p>
              </div>
              <div className='p-3 rounded-xl bg-emerald-500/10'>
                <CheckCircle className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-card border-border shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.applications}
                </p>
                <p className='text-sm text-muted-foreground'>Candidaturas</p>
              </div>
              <div className='p-3 rounded-xl bg-amber-500/10'>
                <TrendingUp className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Buscar...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 border-slate-200'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-40 border-slate-200'>
                <Filter className='h-4 w-4 mr-2 text-slate-400' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos</SelectItem>
                <SelectItem value='aberta'>Abertas</SelectItem>
                <SelectItem value='pausada'>Pausadas</SelectItem>
                <SelectItem value='fechada'>Encerradas</SelectItem>
                <SelectItem value='rascunho'>Rascunhos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className='bg-white border-slate-200 animate-pulse'>
              <CardContent className='p-6 space-y-4'>
                <div className='h-5 bg-slate-100 rounded w-3/4' />
                <div className='h-4 bg-slate-100 rounded w-1/2' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className='bg-white border-slate-200'>
          <CardContent className='p-16 text-center'>
            <div className='inline-flex p-4 rounded-full bg-slate-100 mb-4'>
              <Briefcase className='h-10 w-10 text-slate-400' />
            </div>
            <h3 className='text-lg font-medium text-slate-700 mb-2'>
              Nenhuma vaga
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {filteredJobs.map((job) => {
            const status = statusConfig[job.status] || statusConfig.rascunho;
            const type = typeConfig[job.modalidade] || typeConfig.hibrido;
            const StatusIcon = status.icon;
            const TypeIcon = type.icon;
            const appCount = applicationsCount[job.id] || 0;
            return (
              <Card
                key={job.id}
                className='group bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-foreground text-lg group-hover:text-primary transition-colors'>
                        {job.titulo}
                      </CardTitle>
                      <div className='flex items-center gap-2 text-slate-500 text-sm'>
                        <Building2 className='h-4 w-4' />
                        {job.empresa?.nome || 'Empresa'}
                        {/* Department removed from type, handled via description/props if needed */}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${status.bgColor} ${status.color} ${status.borderColor}`}
                    >
                      <StatusIcon className='h-3 w-3' />
                      {status.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-slate-500 text-sm line-clamp-2'>
                    {job.descricao}
                  </p>
                  <div className='flex flex-wrap gap-3 text-sm'>
                    <span className='flex items-center gap-1 text-slate-500'>
                      <TypeIcon className='h-4 w-4 text-blue-500' />
                      {type.label}
                    </span>
                    {job.localizacao && (
                      <span className='flex items-center gap-1 text-slate-500'>
                        <MapPin className='h-4 w-4 text-rose-500' />
                        {job.localizacao}
                      </span>
                    )}
                    {(job.salarioMin || job.salarioMax) && (
                      <span className='flex items-center gap-1 text-slate-500'>
                        <DollarSign className='h-4 w-4 text-emerald-500' />
                        {job.salarioMin && job.salarioMax
                          ? `${job.salarioMin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - ${job.salarioMax.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                          : job.salarioMin
                            ? `A partir de ${job.salarioMin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                            : `Até ${job.salarioMax?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                      </span>
                    )}
                    <span className='flex items-center gap-1 text-slate-500'>
                      <Users className='h-4 w-4 text-amber-500' />
                      {appCount} candidatos
                    </span>
                  </div>
                  <div className='flex gap-2 pt-2'>
                    {/* Status Actions */}
                    {job.status === 'rascunho' && (
                      <Button
                        size='sm'
                        variant='outline'
                        className='flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        onClick={() => handleStatusChange(job, 'publish')}
                        disabled={saving}
                      >
                        <CheckCircle className='h-3.5 w-3.5 mr-1.5' />
                        Publicar
                      </Button>
                    )}
                    {job.status === 'aberta' && (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1 border-amber-200 text-amber-600 hover:bg-amber-50'
                          onClick={() => handleStatusChange(job, 'pause')}
                          disabled={saving}
                        >
                          <Clock className='h-3.5 w-3.5 mr-1.5' />
                          Pausar
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1 border-slate-200 text-slate-600 hover:bg-slate-50'
                          onClick={() => handleStatusChange(job, 'close')}
                          disabled={saving}
                        >
                          <XCircle className='h-3.5 w-3.5 mr-1.5' />
                          Encerrar
                        </Button>
                      </>
                    )}
                    {job.status === 'pausada' && (
                      <Button
                        size='sm'
                        variant='outline'
                        className='flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        onClick={() => handleStatusChange(job, 'resume')}
                        disabled={saving}
                      >
                        <TrendingUp className='h-3.5 w-3.5 mr-1.5' />
                        Reabrir
                      </Button>
                    )}

                    <Button
                      size='sm'
                      onClick={() => handleEdit(job)}
                      className='bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white'
                    >
                      <Edit2 className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => confirmDelete(job)}
                      className='border-border text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
