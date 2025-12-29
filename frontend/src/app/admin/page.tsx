'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RouteGuard from '@/components/RouteGuard';

export default function AdminPage() {
  return (
    <RouteGuard requireAuth>
      <AdminRedirect />
    </RouteGuard>
  );
}

function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">در حال انتقال به داشبورد...</p>
      </div>
    </div>
  );
}
