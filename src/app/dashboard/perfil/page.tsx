'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useMe,
  useMyProfile,
  useCreateProfile,
  useUpdateProfile,
} from '@/hooks';
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
  AlertTriangle,
  Edit2,
  Save,
} from 'lucide-react';

export default function PerfilPage() {
  const { data: me } = useMe();
  const { data: profile } = useMyProfile();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      });
    }
  }, [profile]);

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
          <div className='border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer'>
            <div className='inline-flex p-4 rounded-xl bg-slate-100 mb-3'>
              <FileText className='h-8 w-8 text-slate-500' />
            </div>
            <p className='text-slate-700 font-medium mb-1'>
              Arraste seu currículo aqui
            </p>
            <p className='text-slate-400 text-sm mb-4'>
              PDF, DOC ou DOCX até 5MB
            </p>
            <Button
              variant='outline'
              className='border-slate-200 text-slate-600 hover:bg-slate-100'
            >
              Selecionar Arquivo
            </Button>
          </div>
        </CardContent>
      </Card>

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
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  habilidades: e.target.value
                    .split(',')
                    .map((h) => h.trim())
                    .filter(Boolean),
                }))
              }
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
              className='border-slate-200 bg-slate-50'
            />
          </div>
          <Button className='bg-blue-600 hover:bg-blue-700'>
            Salvar Links
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
