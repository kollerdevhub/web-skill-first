'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
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
  MapPin,
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
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);

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
              <AvatarImage
                src={session?.user?.image || ''}
                alt={session?.user?.name || ''}
              />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-medium'>
                {session?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='text-slate-900 text-2xl'>
                {session?.user?.name}
              </CardTitle>
              <CardDescription className='text-slate-500 flex items-center gap-1'>
                <Mail className='h-3 w-3' />
                {session?.user?.email}
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
            <Button
              variant='outline'
              className='border-slate-200 text-slate-600 hover:bg-slate-100'
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Salvar
                </>
              ) : (
                <>
                  <Edit2 className='h-4 w-4 mr-2' />
                  Editar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Nome Completo</Label>
              <Input
                defaultValue={session?.user?.name || ''}
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
                defaultValue={session?.user?.email || ''}
                disabled
                className='border-slate-200 bg-slate-100'
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
                disabled={!isEditing}
                className='border-slate-200 bg-slate-50 disabled:bg-slate-100'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700 flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                Localização
              </Label>
              <Input
                placeholder='São Paulo, SP'
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
              disabled={!isEditing}
              className='border-slate-200 bg-slate-50 disabled:bg-slate-100 resize-none'
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
