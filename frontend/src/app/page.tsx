'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                شرکت صرافی کارآفرین
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    خوش آمدید، {user?.firstName}
                  </span>
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    داشبورد
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  ورود / ثبت نام
                </Link>
              )}
              <Link
                href="/feedback"
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                انتقادات و پیشنهادات
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              پلتفرم هوشمند
              <span className="text-blue-600 block">ارزیابی و مشارکت</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              سیستم جامع ارزیابی عملکرد و صندوق انتقادات و پیشنهادات
              برای بهبود مستمر سازمان
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  ورود به داشبورد
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  شروع کنید
                </Link>
              )}
              <Link
                href="/feedback"
                className="bg-white text-gray-900 px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-lg"
              >
                ارسال نظر ناشناس
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              امکانات سیستم
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ابزارهای مدرن برای ارزیابی عملکرد، مشارکت کارکنان و بهبود سازمان
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Authentication */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                احراز هویت امن
              </h3>
              <p className="text-gray-600">
                سیستم ورود و ثبت نام ایمن با قابلیت تغییر رمز عبور
              </p>
            </div>

            {/* Org Chart */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                چارت سازمانی
              </h3>
              <p className="text-gray-600">
                نمایش ساختار سازمانی به صورت تعاملی و پویا
              </p>
            </div>

            {/* Feedback */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                صندوق انتقادات
              </h3>
              <p className="text-gray-600">
                امکان ارسال نظرات و پیشنهادات به صورت کاملاً ناشناس
              </p>
            </div>

            {/* Performance */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ارزیابی عملکرد
              </h3>
              <p className="text-gray-600">
                سیستم جامع ارزیابی عملکرد مدیران و کارکنان
              </p>
            </div>

            {/* Analytics */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                تحلیل و گزارش
              </h3>
              <p className="text-gray-600">
                گزارش‌های تحلیلی جامع و نمودارهای عملکرد
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            آماده شروع هستید؟
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            به بهبود سازمان خود کمک کنید و صدای کارکنان را بشنوید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              ورود به سیستم
            </Link>
            <Link
              href="/feedback"
              className="bg-transparent text-white px-8 py-3 rounded-lg border border-white hover:bg-white hover:text-blue-600 transition-colors font-medium text-lg"
            >
              ارسال نظر ناشناس
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">شرکت صرافی کارآفرین</h3>
            <p className="text-gray-400">
              پلتفرم هوشمند ارزیابی و مشارکت سازمانی
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}