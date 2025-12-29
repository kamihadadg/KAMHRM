'use client';

import { useAuth } from '@/contexts/AuthContext';
import RouteGuard from '@/components/RouteGuard';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import HRAdminDashboard from '@/components/HRAdminDashboard';
import MiddleManagerDashboard from '@/components/MiddleManagerDashboard';
import PersonnelDashboard from '@/components/PersonnelDashboard';

export default function DashboardPage() {
  return (
    <RouteGuard requireAuth>
      <DashboardContent />
    </RouteGuard>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  if (user.role === 'SUPERADMIN') {
    return <SuperAdminDashboard />;
  }
  if (user.role === 'HRADMIN') {
    return <HRAdminDashboard />;
  }
  if (user.role === 'MIDDLEMANAGER') {
    return <MiddleManagerDashboard />;
  }
  if (user.role === 'PERSONNEL') {
    return <PersonnelDashboard />;
  }

  // Fallback to personnel dashboard
  return <PersonnelDashboard />;
}
