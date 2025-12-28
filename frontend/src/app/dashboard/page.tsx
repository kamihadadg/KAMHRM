'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveSurveys, getCommentCount } from '@/lib/api';
import { Survey } from '@/types/survey';
import RouteGuard from '@/components/RouteGuard';
import HydrationWrapper from '@/components/HydrationWrapper';

export default function DashboardPage() {
  return (
    <RouteGuard requireAuth>
      <DashboardContent />
    </RouteGuard>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [daysSinceJoin, setDaysSinceJoin] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Calculate client-side values after hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      setCurrentDate(new Date().toLocaleDateString('fa-IR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));

      const days = Math.floor((new Date().getTime() - new Date(user.createdAt || new Date()).getTime()) / (1000 * 60 * 60 * 24));
      setDaysSinceJoin(days);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [activeSurveys, comments] = await Promise.all([
        getActiveSurveys(),
        getCommentCount().catch(() => null)
      ]);
      setSurveys(activeSurveys);
      setCommentCount(comments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                داشبورد کاربر
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                خوش آمدید، {user.firstName} {user.lastName}
              </span>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  پنل مدیریت
                </Link>
              )}
              <button
                onClick={logout}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* User Info Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                اطلاعات کاربری
              </h2>
              <Link
                href="/settings"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                ویرایش اطلاعات
              </Link>
            </div>

            <div className="flex items-start space-x-6 space-x-reverse">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `http://192.168.1.112:8081${user.profileImageUrl}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    کد پرسنلی
                  </label>
                  <p className="text-gray-900 font-medium">{user.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    نام و نام خانوادگی
                  </label>
                  <p className="text-gray-900 font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    سمت سازمانی
                  </label>
                  <p className="text-gray-900">
                    {user.position ? user.position.title : 'تعریف نشده'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    نقش
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                        user.role === 'HR' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {user.role === 'EMPLOYEE' ? 'کارمند' :
                      user.role === 'MANAGER' ? 'مدیر' :
                        user.role === 'HR' ? 'منابع انسانی' : 'مدیر سیستم'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    مدیر مستقیم
                  </label>
                  <p className="text-gray-900">
                    {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : 'ندارد'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    آخرین ورود
                  </label>
                  <p className="text-gray-900 text-sm">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fa-IR') : 'اولین ورود'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    نام کاربری
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    وضعیت حساب
                  </label>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    فعال
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">نظرسنجی‌های فعال</p>
                  <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">کارمندان زیرمجموعه</p>
                  <p className="text-2xl font-bold text-gray-900">{user.subordinates?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">نظرات ثبت شده</p>
                  <p className="text-2xl font-bold text-gray-900">{commentCount !== null ? commentCount : '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">روزهای کاری</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {daysSinceJoin}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Surveys */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    نظرسنجی‌ها
                  </h3>
                  <p className="text-gray-500">
                    {surveys.length} نظرسنجی فعال
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/surveys"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  مشاهده همه →
                </Link>
              </div>
            </div>

            {/* Org Chart */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    چارت سازمانی
                  </h3>
                  <p className="text-gray-500">
                    ساختار سازمانی شرکت
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/org-chart"
                  className="text-green-600 hover:text-green-500 text-sm font-medium"
                >
                  مشاهده چارت →
                </Link>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    تنظیمات
                  </h3>
                  <p className="text-gray-500">
                    تغییر رمز عبور و اطلاعات
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/settings"
                  className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                >
                  تنظیمات حساب →
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 012 21h13.78a4 4 0 004-4V9a4 4 0 00-4-4H8.56a6.03 6.03 0 01-1.593-3.823L6.25 3.8A4.978 4.978 0 005 8v6.683z" />
                  </svg>
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    اعلان‌ها
                  </h3>
                  <p className="text-gray-500">
                    اخبار و اطلاعیه‌های سازمانی
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button className="text-yellow-600 hover:text-yellow-500 text-sm font-medium">
                  مشاهده اعلان‌ها →
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity & Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Active Surveys */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  نظرسنجی‌های فعال
                </h2>
                <Link
                  href="/surveys"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  مشاهده همه
                </Link>
              </div>

              {surveys.length > 0 ? (
                <div className="space-y-3">
                  {surveys.slice(0, 3).map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{survey.title}</h3>
                        {survey.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{survey.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {survey.endDate ? `تا ${new Date(survey.endDate).toLocaleDateString('fa-IR')}` : 'بدون محدودیت زمانی'}
                        </div>
                      </div>
                      <Link
                        href={`/survey/${survey.id}`}
                        className="mr-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        شرکت
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">هیچ نظرسنجی فعالی وجود ندارد.</p>
                </div>
              )}
            </div>

            {/* Upcoming Events & Calendar */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  رویدادهای پیش رو
                </h2>
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  تقویم کامل
                </button>
              </div>

              <div className="space-y-3">
                {/* Sample events - in real app, this would come from API */}
                <div className="flex items-start p-3 border border-gray-200 rounded-md">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 ml-3"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">جلسه تیم توسعه</h4>
                    <p className="text-sm text-gray-600 mt-1">بررسی پیشرفت پروژه‌های جاری</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      فردا - ۱۴:۰۰
                    </div>
                  </div>
                </div>

                <div className="flex items-start p-3 border border-gray-200 rounded-md">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 ml-3"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">مهلت ارسال گزارش ماهانه</h4>
                    <p className="text-sm text-gray-600 mt-1">ارسال گزارش عملکرد به مدیریت</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ۵ روز دیگر
                    </div>
                  </div>
                </div>

                <div className="flex items-start p-3 border border-gray-200 rounded-md">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2 ml-3"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">آموزش نرم‌افزار جدید</h4>
                    <p className="text-sm text-gray-600 mt-1">دوره آموزشی سیستم مدیریت پروژه</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      ۱۵ اردیبهشت - ۰۹:۰۰
                    </div>
                  </div>
                </div>
              </div>

              <HydrationWrapper fallback={
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">امروز:</span>
                    <span className="font-medium text-gray-900">در حال بارگذاری...</span>
                  </div>
                </div>
              }>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">امروز:</span>
                    <span className="font-medium text-gray-900">
                      {currentDate}
                    </span>
                  </div>
                </div>
              </HydrationWrapper>
            </div>
          </div>

          {/* Quick Access Panel */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              دسترسی‌های سریع
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link
                href="/surveys"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">نظرسنجی‌ها</span>
              </Link>

              <Link
                href="/org-chart"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">چارت سازمانی</span>
              </Link>

              <Link
                href="/settings"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">تنظیمات</span>
              </Link>

              <Link
                href="/feedback"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6 text-pink-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">صندوق پیشنهادات</span>
              </Link>

              <button
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => window.print()}
              >
                <svg className="w-6 h-6 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">چاپ</span>
              </button>

              <button
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {/* Export dashboard data */ }}
              >
                <svg className="w-6 h-6 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">اکسپورت</span>
              </button>

              <button
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => loadDashboardData()}
              >
                <svg className="w-6 h-6 text-teal-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium text-gray-900">تازه‌سازی</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
