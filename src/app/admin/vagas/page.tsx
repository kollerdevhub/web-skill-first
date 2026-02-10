'use client';

import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { vagasService } from '@/lib/api/services/vagas.service';
import {
  Vaga,
  CreateVagaDTO,
  Modalidade,
  TipoContrato,
  VagaStatus,
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
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
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
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Vaga | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Stats
  const [applicationsCount, setApplicationsCount] = useState<
    Record<string, number>
  >({});

  const [formData, setFormData] = useState<
    CreateVagaDTO & { empresaNome?: string }
  >({
    titulo: '',
    empresaId: '', // We might need to handle this or just input text
    empresaNome: '', // handling company name input manually since CreateVagaDTO uses ID
    descricao: '',
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

  useEffect(() => {
    fetchJobs();
  }, []);

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
      requisitos: requirementsText
        .split('\n')
        .filter(Boolean)
        .map((r) => ({ tipo: 'obrigatorio', descricao: r })),
      beneficios: benefitsText.split('\n').filter(Boolean),
      // Mock empresaId for now if used manually
      empresaId: formData.empresaId || 'manual',
      // Note: backend might require valid empresaId.
      // If we are listing companies, we should fetch them.
      // For now, let's assume valid ID is somehow managed or we mock it.
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
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Erro ao salvar vaga');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (job: Vaga) => {
    setEditingJob(job);
    setFormData({
      titulo: job.titulo,
      empresaId: job.empresaId,
      empresaNome: job.empresa?.nome || '',
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
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"?`)) return;
    setDeletingId(id);
    try {
      await vagasService.delete(id);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Erro ao excluir vaga');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      titulo: '',
      empresaId: '',
      empresaNome: '',
      descricao: '',
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
            <h1 className='text-3xl font-bold text-slate-900'>Vagas</h1>
            <p className='text-slate-500 text-sm'>
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
          <DialogContent className='bg-white border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto'>
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
                {/* 
                  TODO: Implement company selection (Select from empresasService) 
                  For now using simple input for company ID or name placeholder
                */}
                <div className='space-y-2'>
                  <Label>ID Empresa *</Label>
                  <Input
                    value={formData.empresaId}
                    onChange={(e) =>
                      setFormData({ ...formData, empresaId: e.target.value })
                    }
                    placeholder='ID da empresa'
                    className='border-slate-200'
                    required
                  />
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
                  <Input
                    type='number'
                    value={formData.salarioMin || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salarioMin: Number(e.target.value),
                      })
                    }
                    className='border-slate-200'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Salário Máx</Label>
                  <Input
                    type='number'
                    value={formData.salarioMax || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salarioMax: Number(e.target.value),
                      })
                    }
                    className='border-slate-200'
                  />
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
                  className='border-slate-200'
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
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.total}
                </p>
                <p className='text-sm text-slate-500'>Total</p>
              </div>
              <div className='p-3 rounded-xl bg-blue-50'>
                <Briefcase className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.active}
                </p>
                <p className='text-sm text-slate-500'>Abertas</p>
              </div>
              <div className='p-3 rounded-xl bg-emerald-50'>
                <CheckCircle className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.applications}
                </p>
                <p className='text-sm text-slate-500'>Candidaturas</p>
              </div>
              <div className='p-3 rounded-xl bg-amber-50'>
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
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-slate-900 text-lg group-hover:text-blue-600 transition-colors'>
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
                        R$ {job.salarioMin} - {job.salarioMax}
                      </span>
                    )}
                    <span className='flex items-center gap-1 text-slate-500'>
                      <Users className='h-4 w-4 text-amber-500' />
                      {appCount} candidatos
                    </span>
                  </div>
                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      onClick={() => handleEdit(job)}
                      className='flex-1 bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white'
                    >
                      <Edit2 className='h-3.5 w-3.5 mr-1.5' />
                      Editar
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleDelete(job.id, job.titulo)}
                      disabled={deletingId === job.id}
                      className='border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                    >
                      {deletingId === job.id ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Trash2 className='h-3.5 w-3.5' />
                      )}
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
