'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RouteGuard from '@/components/RouteGuard';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  return (
    <RouteGuard requireAuth>
      <SettingsContent />
    </RouteGuard>
  );
}

function SettingsContent() {
  const { user, changePassword } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    router.push('/login');
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('رمز عبور جدید و تکرار آن یکسان نیستند');
      return;
    }

    if (newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('رمز عبور با موفقیت تغییر یافت');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در تغییر رمز عبور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="تنظیمات حساب کاربری" showDashboardLink={true} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                اطلاعات پروفایل
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    نام و نام خانوادگی
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    کد پرسنلی
                  </label>
                  <p className="text-gray-900 mt-1">{user.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    نقش
                  </label>
                  <p className="text-gray-900 mt-1">
                    {user.role === 'PERSONNEL' ? 'پرسنل' :
                     user.role === 'MIDDLEMANAGER' ? 'مدیر میانی' :
                     user.role === 'HRADMIN' ? 'مدیر منابع انسانی' : 'مدیر سیستم'}
                  </p>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                تغییر رمز عبور
              </h2>

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور فعلی
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="حداقل ۶ کاراکتر"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                </button>
              </form>
            </div>

            {/* Account Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                عملیات حساب
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div>
                    <h3 className="font-medium text-gray-900">خروج از حساب</h3>
                    <p className="text-sm text-gray-600">
                      از حساب کاربری خود خارج شوید
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    برای خروج از حساب کاربری، از منوی کاربر در بالای صفحه استفاده کنید.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
