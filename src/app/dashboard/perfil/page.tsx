'use client';

import { useEffect, useMemo, useState } from 'react';
import { Resume } from '@/lib/api/types';
import { resumesService } from '@/lib/api/services/resumes.service';
import {
  useMe,
  useMyProfile,
  useCreateProfile,
  useUpdateProfile,
  useUploadCurriculo,
  useDeleteCurriculo,
} from '@/hooks';
import { useResumeParser } from '@/hooks/useResumeParser';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  Upload,
  Brain,
  CheckCircle2,
  Sparkles,
  Briefcase,
  GraduationCap,
  Code2,
  Hash,
  AlertTriangle,
  Edit2,
  Save,
  Trash2,
  Loader2,
  Download,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function PerfilPage() {
  const { data: me } = useMe();
  const { data: profile } = useMyProfile();
  const { toast } = useToast();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const uploadCurriculo = useUploadCurriculo();
  const deleteCurriculo = useDeleteCurriculo();
  const { user } = useFirebaseAuth();
  const {
    status: parserStatus,
    progress: parserProgress,
    parsedResume,
    parseResume,
  } = useResumeParser();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedResume, setSavedResume] = useState<Resume | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    dataNascimento: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
    habilidades: [] as string[],
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        nome: profile.nome || '',
        cpf: profile.cpf || '',
        telefone: profile.telefone || '',
        dataNascimento: profile.dataNascimento
          ? profile.dataNascimento.slice(0, 10)
          : '',
        endereco: {
          logradouro: profile.endereco?.logradouro || '',
          numero: profile.endereco?.numero || '',
          complemento: profile.endereco?.complemento || '',
          bairro: profile.endereco?.bairro || '',
          cidade: profile.endereco?.cidade || '',
          estado: profile.endereco?.estado || '',
          cep: profile.endereco?.cep || '',
        },
        habilidades: profile.habilidades || [],
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
      });
    }
  }, [profile]);

  // Load saved resume analysis from Firestore
  useEffect(() => {
    if (!user) return;
    setLoadingResume(true);
    resumesService
      .getResume(user.uid)
      .then((r) => setSavedResume(r))
      .catch(() => {})
      .finally(() => setLoadingResume(false));
  }, [user, parsedResume]);

  const displayName = profile?.nome || me?.email?.split('@')[0] || 'Usuário';
  const displayEmail = me?.email || '';

  const habilidadesString = useMemo(
    () => form.habilidades.join(', '),
    [form.habilidades],
  );

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    const payload = {
      ...form,
      habilidades: form.habilidades.filter(Boolean),
    };
    const required = [
      ['Nome', payload.nome],
      ['CPF', payload.cpf],
      ['Telefone', payload.telefone],
      ['Data de nascimento', payload.dataNascimento],
      ['Logradouro', payload.endereco.logradouro],
      ['Número', payload.endereco.numero],
      ['Bairro', payload.endereco.bairro],
      ['Cidade', payload.endereco.cidade],
      ['Estado', payload.endereco.estado],
      ['CEP', payload.endereco.cep],
    ];
    const missing = required.filter(([, v]) => !v || !String(v).trim());
    if (missing.length) {
      setError(`Preencha: ${missing.map((m) => m[0]).join(', ')}`);
      setSaving(false);
      return;
    }
    try {
      if (profile) {
        await updateProfile.mutateAsync(payload);
      } else {
        await createProfile.mutateAsync(payload);
      }
      setMessage('Perfil salvo com sucesso.');
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o perfil.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file to Cloudinary
      await uploadCurriculo.mutateAsync(file);
      toast({
        title: 'Sucesso',
        description: 'Currículo enviado! Extraindo dados com IA...',
      });

      // 2. Parse PDF and extract structured data with LLM
      if (user && file.type === 'application/pdf') {
        parseResume(file, user.uid);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao enviar currículo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  }

  async function handleDeleteCurriculo() {
    if (!confirm('Tem certeza que deseja remover seu currículo?')) return;

    setUploading(true);
    try {
      await deleteCurriculo.mutateAsync();
      toast({
        title: 'Sucesso',
        description: 'Currículo removido com sucesso!',
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover currículo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className='space-y-6 max-w-3xl'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <User className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Meu Perfil</h1>
          <p className='text-slate-500 text-sm'>
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Avatar className='h-20 w-20 ring-4 ring-slate-100'>
              <AvatarImage src={undefined} alt={displayName} />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-medium'>
                {displayName.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='text-slate-900 text-2xl'>
                {displayName}
              </CardTitle>
              <CardDescription className='text-slate-500 flex items-center gap-1'>
                <Mail className='h-3 w-3' />
                {displayEmail}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Info */}
      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle className='text-slate-900 flex items-center gap-2'>
              <FileText className='h-5 w-5 text-blue-500' />
              Informações Pessoais
            </CardTitle>
            <div className='flex gap-2'>
              {isEditing && (
                <Button
                  variant='outline'
                  className='border-slate-200 text-slate-600 hover:bg-slate-100'
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant='outline'
                className='border-slate-200 text-slate-600 hover:bg-slate-100'
                onClick={() => {
                  if (isEditing) {
                    void handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={saving}
              >
                {isEditing ? (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </>
                ) : (
                  <>
                    <Edit2 className='h-4 w-4 mr-2' />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {message && (
            <div className='rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700'>
              {message}
            </div>
          )}
          {error && (
            <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
              {error}
            </div>
          )}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Nome Completo</Label>
              <Input
                value={form.nome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nome: e.target.value }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700 flex items-center gap-1'>
                <Mail className='h-3 w-3' />
                Email
              </Label>
              <Input
                type='email'
                defaultValue={displayEmail}
                disabled
                className='border-slate-200 bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700 flex items-center gap-1'>
                CPF
              </Label>
              <Input
                placeholder='000.000.000-00'
                value={form.cpf}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cpf: e.target.value }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700 flex items-center gap-1'>
                <Phone className='h-3 w-3' />
                Telefone
              </Label>
              <Input
                type='tel'
                placeholder='(11) 99999-9999'
                value={form.telefone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, telefone: e.target.value }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700 flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                Data de nascimento
              </Label>
              <Input
                type='date'
                value={form.dataNascimento}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dataNascimento: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label className='text-slate-700'>Bio</Label>
            <Textarea
              placeholder='Conte um pouco sobre você...'
              rows={4}
              disabled
              className='border-slate-200 bg-slate-100 resize-none'
            />
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-slate-900 flex items-center gap-2'>
            <Upload className='h-5 w-5 text-blue-500' />
            Currículo
          </CardTitle>
          <CardDescription className='text-slate-500'>
            Faça upload do seu currículo para facilitar candidaturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.curriculoUrl ? (
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-4 border rounded-xl bg-slate-50'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-red-100 text-red-600 rounded-lg'>
                    <FileText className='h-6 w-6' />
                  </div>
                  <div>
                    <p className='font-medium text-slate-900'>
                      Currículo Enviado
                    </p>
                    <a
                      href={profile.curriculoUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs text-blue-600 hover:underline flex items-center gap-1'
                    >
                      <Eye className='h-3 w-3' />
                      Visualizar arquivo
                    </a>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-slate-500 hover:text-red-600 hover:bg-red-50'
                    onClick={handleDeleteCurriculo}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash2 className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              {/* Parser Status */}
              {parserStatus !== 'idle' && parserStatus !== 'done' && (
                <div className='flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl'>
                  <Loader2 className='h-5 w-5 text-purple-500 animate-spin shrink-0' />
                  <div>
                    <p className='text-sm font-medium text-purple-700'>
                      Processando currículo com IA
                    </p>
                    <p className='text-xs text-purple-500'>{parserProgress}</p>
                  </div>
                </div>
              )}

              {parserStatus === 'done' && parsedResume && (
                <div className='p-3 bg-emerald-50 border border-emerald-100 rounded-xl'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                    <p className='text-sm font-medium text-emerald-700'>
                      Dados extraídos com sucesso!
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {parsedResume.hardSkills.slice(0, 8).map((s, i) => (
                      <span
                        key={i}
                        className='px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full'
                      >
                        {s}
                      </span>
                    ))}
                    {parsedResume.hardSkills.length > 8 && (
                      <span className='px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded-full'>
                        +{parsedResume.hardSkills.length - 8}
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-emerald-500 mt-1'>
                    <Sparkles className='h-3 w-3 inline mr-1' />
                    Esses dados serão usados automaticamente no match de vagas
                  </p>
                </div>
              )}

              {parserStatus === 'error' && (
                <div className='flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl'>
                  <AlertTriangle className='h-5 w-5 text-red-500 shrink-0' />
                  <p className='text-sm text-red-600'>{parserProgress}</p>
                </div>
              )}
            </div>
          ) : (
            <div className='border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer relative'>
              <input
                type='file'
                accept='.pdf,.doc,.docx'
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className='inline-flex p-4 rounded-xl bg-slate-100 mb-3'>
                {uploading ? (
                  <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
                ) : (
                  <FileText className='h-8 w-8 text-slate-500' />
                )}
              </div>
              <p className='text-slate-700 font-medium mb-1'>
                {uploading ? 'Enviando...' : 'Arraste seu currículo aqui'}
              </p>
              <p className='text-slate-400 text-sm mb-4'>
                PDF, DOC ou DOCX até 5MB
              </p>
              <Button
                variant='outline'
                className='border-slate-200 text-slate-600 hover:bg-slate-100 pointer-events-none'
              >
                Selecionar Arquivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Analysis Card */}
      {savedResume && (
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-900 flex items-center gap-2'>
              <Brain className='h-5 w-5 text-purple-500' />
              Análise do Currículo
            </CardTitle>
            <CardDescription className='text-slate-500'>
              <Sparkles className='h-3 w-3 inline mr-1' />
              Dados extraídos automaticamente pela IA do seu currículo
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>
            {/* Hard Skills */}
            {savedResume.hardSkills.length > 0 && (
              <div>
                <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2'>
                  <Code2 className='h-4 w-4 text-blue-500' />
                  Competências Técnicas
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                  {savedResume.hardSkills.map((s, i) => (
                    <span
                      key={i}
                      className='px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium'
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {savedResume.softSkills.length > 0 && (
              <div>
                <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2'>
                  <User className='h-4 w-4 text-emerald-500' />
                  Competências Comportamentais
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                  {savedResume.softSkills.map((s, i) => (
                    <span
                      key={i}
                      className='px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-100 font-medium'
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {savedResume.experiencias.length > 0 && (
              <div>
                <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2'>
                  <Briefcase className='h-4 w-4 text-orange-500' />
                  Experiências Identificadas
                </h4>
                <div className='space-y-2'>
                  {savedResume.experiencias.map((e, i) => (
                    <div
                      key={i}
                      className='p-2.5 bg-slate-50 rounded-lg border border-slate-100'
                    >
                      <p className='text-sm font-medium text-slate-800'>
                        {e.cargo}
                      </p>
                      {e.empresa && (
                        <p className='text-xs text-slate-500'>{e.empresa}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {savedResume.formacao.length > 0 && (
              <div>
                <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2'>
                  <GraduationCap className='h-4 w-4 text-indigo-500' />
                  Formação Acadêmica
                </h4>
                <div className='space-y-2'>
                  {savedResume.formacao.map((f, i) => (
                    <div
                      key={i}
                      className='p-2.5 bg-slate-50 rounded-lg border border-slate-100'
                    >
                      <p className='text-sm font-medium text-slate-800'>
                        {f.curso}
                      </p>
                      {f.instituicao && (
                        <p className='text-xs text-slate-500'>
                          {f.instituicao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Courses */}
            {savedResume.cursosConcluidos.length > 0 && (
              <div>
                <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2'>
                  <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                  Cursos Concluídos na Plataforma
                </h4>
                <div className='space-y-2'>
                  {savedResume.cursosConcluidos.map((c, i) => (
                    <div
                      key={i}
                      className='p-2.5 bg-emerald-50 rounded-lg border border-emerald-100'
                    >
                      <p className='text-sm font-medium text-emerald-800'>
                        {c.nome}
                      </p>
                      <p className='text-xs text-emerald-600'>
                        {c.instituicao} • {c.cargaHoraria}h
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {savedResume.keywords.length > 0 && (
              <div>
                <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2'>
                  <Hash className='h-4 w-4 text-slate-400' />
                  Palavras-chave
                </h4>
                <div className='flex flex-wrap gap-1.5'>
                  {savedResume.keywords.map((k, i) => (
                    <span
                      key={i}
                      className='px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full'
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className='text-xs text-slate-400 pt-2 border-t border-slate-100'>
              Última atualização:{' '}
              {new Date(savedResume.updatedAt).toLocaleDateString('pt-BR')}
              {' • '}Esses dados são usados automaticamente na análise de
              compatibilidade com vagas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Endereço e Habilidades */}
      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-slate-900 flex items-center gap-2'>
            <Globe className='h-5 w-5 text-blue-500' />
            Endereço e Habilidades
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Logradouro</Label>
              <Input
                value={form.endereco.logradouro}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endereco: { ...f.endereco, logradouro: e.target.value },
                  }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label>Número</Label>
              <Input
                value={form.endereco.numero}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endereco: { ...f.endereco, numero: e.target.value },
                  }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label>Complemento</Label>
              <Input
                value={form.endereco.complemento}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endereco: { ...f.endereco, complemento: e.target.value },
                  }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label>Bairro</Label>
              <Input
                value={form.endereco.bairro}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endereco: { ...f.endereco, bairro: e.target.value },
                  }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label>Cidade</Label>
              <Input
                value={form.endereco.cidade}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endereco: { ...f.endereco, cidade: e.target.value },
                  }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label>Estado</Label>
              <Input
                value={form.endereco.estado}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().slice(0, 2);
                  setForm((f) => ({
                    ...f,
                    endereco: { ...f.endereco, estado: val },
                  }));
                }}
                maxLength={2}
                placeholder='PR'
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label>CEP</Label>
              <Input
                value={form.endereco.cep}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endereco: { ...f.endereco, cep: e.target.value },
                  }))
                }
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Habilidades (separe por vírgula)</Label>
            <Input
              value={habilidadesString}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  habilidades: val.split(',').map((s) => s.trimStart()), // Maintain trailing spaces/empty items while typing
                }));
              }}
              onBlur={() => {
                setForm((f) => ({
                  ...f,
                  habilidades: f.habilidades
                    .map((h) => h.trim())
                    .filter(Boolean),
                }));
              }}
              placeholder='React, TypeScript, Node.js'
              disabled={!isEditing}
              className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-slate-900 flex items-center gap-2'>
            <LinkIcon className='h-5 w-5 text-blue-500' />
            Links Profissionais
          </CardTitle>
          <CardDescription className='text-slate-500'>
            Adicione seus perfis profissionais
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-slate-700 flex items-center gap-1'>
              <Linkedin className='h-3 w-3' />
              LinkedIn
            </Label>
            <Input
              type='url'
              placeholder='https://linkedin.com/in/seu-perfil'
              value={form.linkedinUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, linkedinUrl: e.target.value }))
              }
              className='border-slate-200 bg-slate-50'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-slate-700 flex items-center gap-1'>
              <Github className='h-3 w-3' />
              GitHub
            </Label>
            <Input
              type='url'
              placeholder='https://github.com/seu-usuario'
              value={form.githubUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, githubUrl: e.target.value }))
              }
              className='border-slate-200 bg-slate-50'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-slate-700 flex items-center gap-1'>
              <Globe className='h-3 w-3' />
              Portfolio
            </Label>
            <Input
              type='url'
              placeholder='https://seu-portfolio.com'
              value={form.portfolioUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, portfolioUrl: e.target.value }))
              }
              className='border-slate-200 bg-slate-50'
            />
          </div>
          <Button
            className='bg-blue-600 hover:bg-blue-700'
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await updateProfile.mutateAsync({
                  linkedinUrl: form.linkedinUrl,
                  githubUrl: form.githubUrl,
                  portfolioUrl: form.portfolioUrl,
                } as any);
                toast({
                  title: 'Sucesso',
                  description: 'Links salvos com sucesso!',
                });
              } catch {
                toast({
                  title: 'Erro',
                  description: 'Falha ao salvar links.',
                  variant: 'destructive',
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Salvando...
              </>
            ) : (
              'Salvar Links'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className='bg-white border-red-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-red-600 flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            Zona de Perigo
          </CardTitle>
          <CardDescription className='text-slate-500'>
            Ações irreversíveis da conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant='outline'
            className='border-red-200 text-red-600 hover:bg-red-50'
          >
            Excluir Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
