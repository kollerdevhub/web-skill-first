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

interface Job {
  id: string;
  title: string;
  company: string;
  department: string | null;
  description: string;
  requirements: string;
  benefits: string | null;
  salaryRange: string | null;
  location: string | null;
  status: string;
  type: string;
  createdAt: string;
  _count?: { applications: number };
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof CheckCircle;
  }
> = {
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
const typeConfig: Record<string, { label: string; icon: typeof Home }> = {
  remote: { label: 'Remoto', icon: Home },
  hybrid: { label: 'Híbrido', icon: RefreshCcw },
  onsite: { label: 'Presencial', icon: Building },
};

export default function AdminVagasPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    department: '',
    description: '',
    requirements: '',
    benefits: '',
    salaryRange: '',
    location: '',
    type: 'hybrid',
    status: 'active',
  });

  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      setJobs(await (await fetch('/api/admin/jobs')).json());
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editingJob ? `/api/admin/jobs/${editingJob.id}` : '/api/admin/jobs',
        {
          method: editingJob ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );
      if (res.ok) {
        fetchJobs();
        setDialogOpen(false);
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      department: job.department || '',
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits || '',
      salaryRange: job.salaryRange || '',
      location: job.location || '',
      type: job.type || 'hybrid',
      status: job.status,
    });
    setDialogOpen(true);
  };
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"?`)) return;
    setDeletingId(id);
    try {
      if ((await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' })).ok)
        setJobs(jobs.filter((j) => j.id !== id));
    } finally {
      setDeletingId(null);
    }
  };
  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      company: '',
      department: '',
      description: '',
      requirements: '',
      benefits: '',
      salaryRange: '',
      location: '',
      type: 'hybrid',
      status: 'active',
    });
  };
  const stats = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter((j) => j.status === 'active').length,
      applications: jobs.reduce(
        (acc, j) => acc + (j._count?.applications || 0),
        0,
      ),
    }),
    [jobs],
  );
  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
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
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='border-slate-200'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Empresa *</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className='border-slate-200'
                    required
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Departamento</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className='border-slate-200'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Localização</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className='border-slate-200'
                  />
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger className='border-slate-200'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='remote'>Remoto</SelectItem>
                      <SelectItem value='hybrid'>Híbrido</SelectItem>
                      <SelectItem value='onsite'>Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Salário</Label>
                  <Input
                    value={formData.salaryRange}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryRange: e.target.value })
                    }
                    className='border-slate-200'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger className='border-slate-200'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Ativa</SelectItem>
                      <SelectItem value='inactive'>Inativa</SelectItem>
                      <SelectItem value='closed'>Encerrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <Label>Descrição *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='border-slate-200 min-h-[100px]'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label>Requisitos *</Label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  className='border-slate-200 min-h-[80px]'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label>Benefícios</Label>
                <Textarea
                  value={formData.benefits}
                  onChange={(e) =>
                    setFormData({ ...formData, benefits: e.target.value })
                  }
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
                <p className='text-sm text-slate-500'>Ativas</p>
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
                <SelectItem value='active'>Ativas</SelectItem>
                <SelectItem value='inactive'>Inativas</SelectItem>
                <SelectItem value='closed'>Encerradas</SelectItem>
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
            const status = statusConfig[job.status] || statusConfig.inactive;
            const type = typeConfig[job.type] || typeConfig.hybrid;
            const StatusIcon = status.icon;
            const TypeIcon = type.icon;
            return (
              <Card
                key={job.id}
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-slate-900 text-lg group-hover:text-blue-600 transition-colors'>
                        {job.title}
                      </CardTitle>
                      <div className='flex items-center gap-2 text-slate-500 text-sm'>
                        <Building2 className='h-4 w-4' />
                        {job.company}
                        {job.department && (
                          <span className='text-slate-400'>
                            • {job.department}
                          </span>
                        )}
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
                    {job.description}
                  </p>
                  <div className='flex flex-wrap gap-3 text-sm'>
                    <span className='flex items-center gap-1 text-slate-500'>
                      <TypeIcon className='h-4 w-4 text-blue-500' />
                      {type.label}
                    </span>
                    {job.location && (
                      <span className='flex items-center gap-1 text-slate-500'>
                        <MapPin className='h-4 w-4 text-rose-500' />
                        {job.location}
                      </span>
                    )}
                    {job.salaryRange && (
                      <span className='flex items-center gap-1 text-slate-500'>
                        <DollarSign className='h-4 w-4 text-emerald-500' />
                        {job.salaryRange}
                      </span>
                    )}
                    <span className='flex items-center gap-1 text-slate-500'>
                      <Users className='h-4 w-4 text-amber-500' />
                      {job._count?.applications || 0} candidatos
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
                      onClick={() => handleDelete(job.id, job.title)}
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
