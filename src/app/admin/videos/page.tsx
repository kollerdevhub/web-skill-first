'use client';

import { useState, useEffect } from 'react';
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Video,
  Upload,
  Clock,
  Copy,
  Check,
  Trash2,
  Play,
  Film,
  HardDrive,
  Loader2,
} from 'lucide-react';

interface UploadedVideo {
  id?: string;
  publicId: string;
  secureUrl: string;
  thumbnailUrl: string;
  duration: number;
  createdAt?: string;
  url: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      const res = await fetch('/api/admin/videos');
      setVideos(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const saveVideo = async (video: UploadedVideo) => {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: video.secureUrl,
        publicId: video.publicId,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
      }),
    });
    if (res.ok) {
      const savedVideo = await res.json();
      setVideos((prev) => [savedVideo, ...prev]);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const formatDuration = (s: number) =>
    s
      ? `${Math.floor(s / 60)}:${Math.floor(s % 60)
          .toString()
          .padStart(2, '0')}`
      : '--:--';

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Video className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Vídeos</h1>
          <p className='text-slate-500 text-sm'>
            Biblioteca de vídeos da plataforma
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {videos.length}
                </p>
                <p className='text-sm text-slate-500'>Total</p>
              </div>
              <div className='p-3 rounded-xl bg-blue-50'>
                <Film className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {Math.round(
                    videos.reduce((a, v) => a + (v.duration || 0), 0) / 60,
                  )}
                  min
                </p>
                <p className='text-sm text-slate-500'>Duração</p>
              </div>
              <div className='p-3 rounded-xl bg-amber-50'>
                <Clock className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>500MB</p>
                <p className='text-sm text-slate-500'>Limite</p>
              </div>
              <div className='p-3 rounded-xl bg-slate-100'>
                <HardDrive className='h-5 w-5 text-slate-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardHeader className='border-b border-slate-100'>
          <CardTitle className='text-slate-900 flex items-center gap-2'>
            <Upload className='h-5 w-5 text-blue-500' />
            Upload
          </CardTitle>
          <CardDescription className='text-slate-500'>
            Envie novos vídeos
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6'>
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{
              maxFiles: 1,
              resourceType: 'video',
              sources: ['local', 'url'],
              clientAllowedFormats: ['mp4', 'webm', 'mov'],
              maxFileSize: 500000000,
            }}
            onSuccess={async (result: CloudinaryUploadWidgetResults) => {
              if (result.info && typeof result.info !== 'string') {
                await saveVideo({
                  publicId: result.info.public_id,
                  secureUrl: result.info.secure_url,
                  thumbnailUrl: result.info.thumbnail_url || '',
                  duration:
                    typeof result.info.duration === 'number'
                      ? result.info.duration
                      : 0,
                  url: result.info.secure_url,
                });
              }
              setUploading(false);
            }}
            onOpen={() => setUploading(true)}
            onClose={() => setUploading(false)}
          >
            {({ open }) => (
              <button
                onClick={() => open?.()}
                className='w-full border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer'
              >
                {uploading ? (
                  <>
                    <Loader2 className='h-10 w-10 text-blue-500 animate-spin mx-auto mb-2' />
                    <p className='text-slate-600 font-medium'>
                      Fazendo upload...
                    </p>
                  </>
                ) : (
                  <>
                    <div className='inline-flex p-4 rounded-xl bg-blue-50 mb-3'>
                      <Upload className='h-8 w-8 text-blue-500' />
                    </div>
                    <p className='text-slate-700 font-medium'>
                      Clique para fazer upload
                    </p>
                    <p className='text-slate-400 text-sm'>
                      MP4, WebM ou MOV • Máximo 500MB
                    </p>
                  </>
                )}
              </button>
            )}
          </CldUploadWidget>
        </CardContent>
      </Card>

      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='bg-white border-slate-200 animate-pulse'>
              <div className='aspect-video bg-slate-100' />
              <CardContent className='p-4 space-y-2'>
                <div className='h-4 bg-slate-100 rounded w-3/4' />
                <div className='h-3 bg-slate-100 rounded w-1/2' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {videos.map((video) => (
            <Card
              key={video.id || video.publicId}
              className='group bg-white border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
            >
              <div className='aspect-video bg-slate-100 relative'>
                <video
                  src={video.secureUrl || video.url}
                  poster={video.thumbnailUrl}
                  className='w-full h-full object-cover'
                  controls
                  playsInline
                  preload='metadata'
                />
                <div className='absolute bottom-2 right-2'>
                  <span className='px-2 py-1 rounded-md bg-black/60 text-white text-xs flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    {formatDuration(video.duration)}
                  </span>
                </div>
              </div>
              <CardContent className='p-4 space-y-3'>
                <p className='text-sm text-slate-700 font-mono truncate'>
                  {video.publicId}
                </p>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        video.secureUrl || video.url,
                        video.id || video.publicId,
                      )
                    }
                    className='flex-1 bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white'
                  >
                    {copiedId === (video.id || video.publicId) ? (
                      <>
                        <Check className='h-3.5 w-3.5 mr-1.5' />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className='h-3.5 w-3.5 mr-1.5' />
                        Copiar URL
                      </>
                    )}
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    className='border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className='bg-white border-slate-200'>
          <CardContent className='p-16 text-center'>
            <div className='inline-flex p-4 rounded-full bg-slate-100 mb-4'>
              <Video className='h-10 w-10 text-slate-400' />
            </div>
            <h3 className='text-lg font-medium text-slate-700 mb-2'>
              Nenhum vídeo
            </h3>
            <p className='text-slate-500'>Faça upload do primeiro vídeo</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
