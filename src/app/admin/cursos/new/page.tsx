'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Clock,
  Tag,
  BarChart3,
  Upload,
  Check,
  Loader2,
} from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: 60,
    imageUrl: '',
    videoUrl: '',
    videoPublicId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(String(formData.duration)),
        }),
      });
      if (res.ok) router.push('/admin/cursos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='outline'
          onClick={() => router.push('/admin/cursos')}
          className='border-slate-200 text-slate-600 hover:bg-slate-100'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar
        </Button>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
            <GraduationCap className='h-5 w-5 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-slate-900'>Novo Curso</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-slate-900 text-lg flex items-center gap-2'>
              <Tag className='h-5 w-5 text-blue-500' />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className='border-slate-200'
                placeholder='Ex: Introdução ao React'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700'>Descrição *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='border-slate-200 min-h-[120px]'
                placeholder='Descreva o conteúdo do curso...'
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-slate-900 text-lg flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-blue-500' />
              Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label className='text-slate-700'>Categoria *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className='border-slate-200'
                  placeholder='Tecnologia'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-slate-700'>Nível</Label>
                <Select
                  value={formData.level}
                  onValueChange={(v) => setFormData({ ...formData, level: v })}
                >
                  <SelectTrigger className='border-slate-200'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='beginner'>Iniciante</SelectItem>
                    <SelectItem value='intermediate'>Intermediário</SelectItem>
                    <SelectItem value='advanced'>Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label className='text-slate-700 flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  Duração (min)
                </Label>
                <Input
                  type='number'
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className='border-slate-200'
                  min='1'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-slate-900 text-lg flex items-center gap-2'>
              <Upload className='h-5 w-5 text-blue-500' />
              Mídia
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-slate-700 flex items-center gap-2'>
                <ImageIcon className='h-4 w-4' />
                Imagem de Capa
              </Label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{
                  maxFiles: 1,
                  resourceType: 'image',
                  sources: ['local', 'url'],
                }}
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                  if (result.info && typeof result.info !== 'string')
                    setFormData({
                      ...formData,
                      imageUrl: result.info.secure_url,
                    });
                }}
              >
                {({ open }) => (
                  <button
                    type='button'
                    onClick={() => open?.()}
                    className={`w-full border-2 border-dashed rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all ${formData.imageUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {formData.imageUrl ? (
                      <>
                        <img
                          src={formData.imageUrl}
                          alt='Imagem'
                          className='w-20 h-14 object-cover rounded-lg shadow'
                        />
                        <div className='flex items-center gap-2 text-emerald-600'>
                          <Check className='h-4 w-4' />
                          <span className='text-sm'>Imagem selecionada</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='p-3 rounded-xl bg-slate-100'>
                          <ImageIcon className='h-6 w-6 text-slate-500' />
                        </div>
                        <div className='text-left'>
                          <p className='text-slate-700 font-medium'>
                            Clique para fazer upload
                          </p>
                          <p className='text-slate-400 text-sm'>
                            PNG, JPG ou WebP
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </CldUploadWidget>
            </div>
            <div className='space-y-2'>
              <Label className='text-slate-700 flex items-center gap-2'>
                <Video className='h-4 w-4' />
                Vídeo do Curso
              </Label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{
                  maxFiles: 1,
                  resourceType: 'video',
                  sources: ['local', 'url'],
                  clientAllowedFormats: ['mp4', 'webm', 'mov'],
                  maxFileSize: 500000000,
                }}
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                  if (result.info && typeof result.info !== 'string')
                    setFormData({
                      ...formData,
                      videoUrl: result.info.secure_url,
                      videoPublicId: result.info.public_id,
                    });
                }}
              >
                {({ open }) => (
                  <button
                    type='button'
                    onClick={() => open?.()}
                    className={`w-full border-2 border-dashed rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all ${formData.videoUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    {formData.videoUrl ? (
                      <>
                        <div className='p-3 rounded-xl bg-emerald-100'>
                          <Video className='h-6 w-6 text-emerald-600' />
                        </div>
                        <div className='flex items-center gap-2 text-emerald-600'>
                          <Check className='h-4 w-4' />
                          <span className='text-sm'>Vídeo selecionado</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='p-3 rounded-xl bg-rose-50'>
                          <Video className='h-6 w-6 text-rose-500' />
                        </div>
                        <div className='text-left'>
                          <p className='text-slate-700 font-medium'>
                            Clique para fazer upload
                          </p>
                          <p className='text-slate-400 text-sm'>
                            MP4, WebM ou MOV (máx 500MB)
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/admin/cursos')}
            className='border-slate-200 text-slate-600'
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Salvando...
              </>
            ) : (
              'Criar Curso'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
