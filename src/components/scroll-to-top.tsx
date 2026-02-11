'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      variant='outline'
      size='icon'
      className='fixed bottom-8 right-8 z-50 rounded-full bg-white shadow-lg border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300'
      onClick={scrollToTop}
      aria-label='Voltar ao topo'
    >
      <ArrowUp className='h-5 w-5' />
    </Button>
  );
}
