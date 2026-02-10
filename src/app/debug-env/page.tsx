'use client';

import { useEffect, useState } from 'react';

export default function EnvDebugPage() {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setEnvStatus({
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }, []);

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Environment Debug</h1>
      <pre className='bg-slate-100 p-4 rounded'>
        {JSON.stringify(envStatus, null, 2)}
      </pre>
      <p className='mt-4 text-sm text-slate-500'>
        If all represent false, your .env file is not being loaded. Restart the
        server: Ctrl+C then npm run dev.
      </p>
    </div>
  );
}
