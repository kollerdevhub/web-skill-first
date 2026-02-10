'use client';

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
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Mail,
  Save,
  Loader2,
} from 'lucide-react';

export default function AdminConfigPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Web Skill First',
    siteDescription: 'Plataforma de desenvolvimento profissional',
    contactEmail: 'contato@webskillfirst.com.br',
    supportEmail: 'suporte@webskillfirst.com.br',
    maxUploadSize: '500',
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Settings className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Configurações</h1>
          <p className='text-slate-500 text-sm'>
            Gerencie as configurações da plataforma
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Configurações Gerais */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-900 flex items-center gap-2'>
              <Globe className='h-5 w-5 text-blue-500' />
              Configurações Gerais
            </CardTitle>
            <CardDescription className='text-slate-500'>
              Informações básicas da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Nome do Site</Label>
              <Input
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className='border-slate-200'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Descrição</Label>
              <Textarea
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings({ ...settings, siteDescription: e.target.value })
                }
                className='border-slate-200'
                rows={3}
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700'>
                Tamanho Máximo de Upload (MB)
              </Label>
              <Input
                type='number'
                value={settings.maxUploadSize}
                onChange={(e) =>
                  setSettings({ ...settings, maxUploadSize: e.target.value })
                }
                className='border-slate-200'
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-900 flex items-center gap-2'>
              <Mail className='h-5 w-5 text-blue-500' />
              Configurações de Email
            </CardTitle>
            <CardDescription className='text-slate-500'>
              Emails de contato e suporte
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Email de Contato</Label>
              <Input
                type='email'
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                className='border-slate-200'
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Email de Suporte</Label>
              <Input
                type='email'
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className='border-slate-200'
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-900 flex items-center gap-2'>
              <Bell className='h-5 w-5 text-blue-500' />
              Notificações
            </CardTitle>
            <CardDescription className='text-slate-500'>
              Configurações de notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'>
              <div>
                <p className='text-slate-700 font-medium'>Notificações Push</p>
                <p className='text-slate-500 text-sm'>
                  Enviar notificações para usuários
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    enableNotifications: !settings.enableNotifications,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enableNotifications ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    settings.enableNotifications
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'>
              <div>
                <p className='text-slate-700 font-medium'>Alertas por Email</p>
                <p className='text-slate-500 text-sm'>
                  Enviar alertas importantes por email
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    enableEmailAlerts: !settings.enableEmailAlerts,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enableEmailAlerts ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    settings.enableEmailAlerts
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-900 flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-500' />
              Segurança
            </CardTitle>
            <CardDescription className='text-slate-500'>
              Configurações de segurança e manutenção
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'>
              <div>
                <p className='text-slate-700 font-medium'>Modo Manutenção</p>
                <p className='text-slate-500 text-sm'>
                  Desabilita acesso para usuários
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    settings.maintenanceMode
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {settings.maintenanceMode && (
              <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                <p className='text-amber-700 text-sm'>
                  ⚠️ O modo manutenção está ativo. Usuários não conseguirão
                  acessar a plataforma.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Botão Salvar */}
      <div className='flex justify-end'>
        <Button
          onClick={handleSave}
          disabled={saving}
          className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
        >
          {saving ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Salvando...
            </>
          ) : (
            <>
              <Save className='h-4 w-4 mr-2' />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
