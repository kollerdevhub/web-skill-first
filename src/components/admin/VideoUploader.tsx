'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Film, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

// ============================================================================
// Types
// ============================================================================

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface VideoUploaderProps {
  /** Chamado ao concluir upload com sucesso */
  onUploadComplete: (url: string, publicId: string) => void;
  /** Pasta no Cloudinary (ex: 'web-skill-first/videos') */
  folder?: string;
  /** Tipos de arquivo aceitos */
  accept?: string;
  /** URL do vídeo já enviado (para exibir estado de sucesso) */
  currentVideoUrl?: string;
  /** Texto do label */
  label?: string;
  /** Desabilitar interação */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function VideoUploader({
  onUploadComplete,
  folder = 'web-skill-first/videos',
  accept = 'video/mp4,video/webm,video/quicktime',
  currentVideoUrl,
  label = 'Upload de Vídeo',
  disabled = false,
}: VideoUploaderProps) {
  const [state, setState] = useState<UploadState>(
    currentVideoUrl ? 'success' : 'idle',
  );
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setState('uploading');
      setProgress(0);
      setErrorMessage('');

      try {
        const { url, publicId } = await uploadToCloudinary(file, {
          resourceType: 'video',
          folder,
          onProgress: (percent) => setProgress(percent),
        });

        setState('success');
        setProgress(100);
        onUploadComplete(url, publicId);
      } catch (err) {
        setState('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Erro desconhecido no upload',
        );
      }
    },
    [folder, onUploadComplete],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleUpload(file);
      // Reset input para permitir re-seleção do mesmo arquivo
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('video/')) {
        void handleUpload(file);
      }
    },
    [handleUpload],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const reset = () => {
    setState('idle');
    setProgress(0);
    setFileName('');
    setErrorMessage('');
  };

  return (
    <div className='space-y-2'>
      {label && <p className='text-sm font-medium text-slate-700'>{label}</p>}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200
          ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          ${isDragOver ? 'border-blue-400 bg-blue-50/60 scale-[1.01]' : ''}
          ${state === 'idle' ? 'border-slate-200 hover:border-blue-300 hover:bg-slate-50' : ''}
          ${state === 'uploading' ? 'border-blue-300 bg-blue-50/30' : ''}
          ${state === 'success' ? 'border-emerald-300 bg-emerald-50/30' : ''}
          ${state === 'error' ? 'border-red-300 bg-red-50/30' : ''}
        `}
      >
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          onChange={handleFileSelect}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          disabled={disabled || state === 'uploading'}
        />

        <div className='p-6 flex flex-col items-center gap-3 text-center'>
          {/* ===== IDLE ===== */}
          {state === 'idle' && (
            <>
              <div className='p-3 rounded-full bg-slate-100'>
                <Upload className='h-6 w-6 text-slate-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  Arraste o vídeo aqui ou clique para selecionar
                </p>
                <p className='text-xs text-slate-400 mt-1'>MP4, WebM ou MOV</p>
              </div>
            </>
          )}

          {/* ===== UPLOADING ===== */}
          {state === 'uploading' && (
            <>
              <div className='p-3 rounded-full bg-blue-100'>
                <Film className='h-6 w-6 text-blue-600 animate-pulse' />
              </div>
              <div className='w-full max-w-xs'>
                <div className='flex items-center justify-between mb-1.5'>
                  <p className='text-sm font-medium text-blue-700 truncate max-w-[180px]'>
                    {fileName}
                  </p>
                  <span className='text-sm font-bold text-blue-600'>
                    {progress}%
                  </span>
                </div>
                {/* Barra de progresso */}
                <div className='w-full h-2.5 bg-blue-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className='text-xs text-blue-500 mt-2'>
                  Enviando para o Cloudinary...
                </p>
              </div>
            </>
          )}

          {/* ===== SUCCESS ===== */}
          {state === 'success' && (
            <>
              <div className='p-3 rounded-full bg-emerald-100'>
                <CheckCircle2 className='h-6 w-6 text-emerald-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-emerald-700'>
                  Vídeo enviado com sucesso!
                </p>
                {fileName && (
                  <p className='text-xs text-emerald-500 mt-0.5 truncate max-w-[250px]'>
                    {fileName}
                  </p>
                )}
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className='border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              >
                <X className='h-3 w-3 mr-1' />
                Trocar vídeo
              </Button>
            </>
          )}

          {/* ===== ERROR ===== */}
          {state === 'error' && (
            <>
              <div className='p-3 rounded-full bg-red-100'>
                <AlertCircle className='h-6 w-6 text-red-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-red-700'>
                  Falha no upload
                </p>
                <p className='text-xs text-red-500 mt-0.5'>{errorMessage}</p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className='border-red-200 text-red-700 hover:bg-red-50'
              >
                Tentar novamente
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
