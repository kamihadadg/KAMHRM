'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  getEvaluationStatistics, 
  getAllPerformanceEvaluations, 
  getAllPerformanceGoals 
} from '@/lib/api';

export default function PersonnelDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Load statistics
      try {
        const statistics = await getEvaluationStatistics(user.id);
        setStats(statistics);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }

      // Load recent evaluations
      try {
        const evalResponse = await getAllPerformanceEvaluations({ page: 1, limit: 5 }, user.id);
        const myEvals = evalResponse.data.filter((e: any) => 
          e.employeeId === user.id || e.evaluatorId === user.id
        );
        setRecentEvaluations(myEvals.slice(0, 5));
        
        // Pending evaluations (where user is evaluator and status is DRAFT)
        const pending = myEvals.filter((e: any) => 
          e.evaluatorId === user.id && e.status === 'DRAFT'
        );
        setPendingEvaluations(pending.slice(0, 3));
      } catch (error) {
        console.error('Error loading evaluations:', error);
      }

      // Load active goals
      try {
        const goalsResponse = await getAllPerformanceGoals({ page: 1, limit: 5 }, user.id);
        const myGoals = goalsResponse.data.filter((g: any) => g.employeeId === user.id);
        setActiveGoals(myGoals.filter((g: any) => 
          g.status === 'IN_PROGRESS' || g.status === 'PENDING'
        ).slice(0, 5));
      } catch (error) {
        console.error('Error loading goals:', error);
      }
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

  const daysSinceJoin = user.createdAt 
    ? Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar title="داشبورد کاربر" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                خوش آمدید، {user.firstName} {user.lastName} 👋
              </h1>
              <p className="text-blue-100 text-lg">
                {user.position ? `سمت: ${user.position.title}` : 'خوش آمدید به سیستم مدیریت منابع انسانی'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Score Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">میانگین امتیاز</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.averageScore ? stats.averageScore.toFixed(1) : '-'}
                {stats?.averageScore && <span className="text-lg text-gray-500">/100</span>}
              </p>
            </div>
          </div>

          {/* Total Evaluations Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">تعداد ارزیابی‌ها</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalEvaluations || recentEvaluations.length || 0}
              </p>
            </div>
          </div>

          {/* Active Goals Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m6 9l-2-2m0 0l-2 2m2-2v6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">اهداف فعال</h3>
              <p className="text-3xl font-bold text-gray-900">{activeGoals.length}</p>
            </div>
          </div>

          {/* Days Since Join Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">روزهای کاری</h3>
              <p className="text-3xl font-bold text-gray-900">{daysSinceJoin}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg mb-4 ring-4 ring-blue-100">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `http://192.168.1.112:8081${user.profileImageUrl}`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-500 text-sm mb-2">{user.position?.title || 'کارمند'}</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'MIDDLEMANAGER' ? 'bg-green-100 text-green-800' :
                  user.role === 'HRADMIN' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'PERSONNEL' ? 'پرسنل' :
                   user.role === 'MIDDLEMANAGER' ? 'مدیر میانی' :
                   user.role === 'HRADMIN' ? 'مدیر منابع انسانی' : 'پرسنل'}
                </span>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">کد پرسنلی</span>
                  <span className="text-gray-900 font-semibold font-mono">{user.employeeId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">نام کاربری</span>
                  <span className="text-gray-900 font-semibold font-mono">{user.username}</span>
                </div>
                {user.manager && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">مدیر مستقیم</span>
                    <span className="text-gray-900 font-semibold">{user.manager.firstName} {user.manager.lastName}</span>
                  </div>
                )}
                {user.lastLoginAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">آخرین ورود</span>
                    <span className="text-gray-900 font-semibold text-xs">
                      {new Date(user.lastLoginAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
              </div>

              <Link
                href="/settings"
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                ویرایش پروفایل
              </Link>
            </div>
          </div>

          {/* Recent Evaluations & Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Evaluations */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  ارزیابی‌های اخیر
                </h3>
                <Link
                  href="/performance"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  مشاهده همه
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : recentEvaluations.length > 0 ? (
                <div className="space-y-3">
                  {recentEvaluations.map((evaluation: any) => (
                    <div key={evaluation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          evaluation.status === 'COMPLETED' ? 'bg-green-100' :
                          evaluation.status === 'PENDING' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            evaluation.status === 'COMPLETED' ? 'text-green-600' :
                            evaluation.status === 'PENDING' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{evaluation.title || 'ارزیابی عملکرد'}</p>
                          <p className="text-sm text-gray-500">
                            {evaluation.evaluationType === 'SELF' ? 'خودارزیابی' :
                             evaluation.evaluationType === 'MANAGER' ? 'ارزیابی مدیر' :
                             evaluation.evaluationType === 'SUBORDINATE' ? 'ارزیابی زیرمجموعه' : 'ارزیابی هم‌ردیف'}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        {evaluation.totalScore !== null && evaluation.totalScore !== undefined ? (
                          <span className="text-lg font-bold text-gray-900">{evaluation.totalScore.toFixed(1)}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>هنوز ارزیابی‌ای ثبت نشده است</p>
                </div>
              )}
            </div>

            {/* Active Goals */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  اهداف فعال
                </h3>
                <Link
                  href="/performance"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                >
                  مشاهده همه
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : activeGoals.length > 0 ? (
                <div className="space-y-3">
                  {activeGoals.map((goal: any) => (
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          goal.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          goal.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {goal.status === 'COMPLETED' ? 'تکمیل شده' :
                           goal.status === 'IN_PROGRESS' ? 'در حال انجام' : 'در انتظار'}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      )}
                      {goal.targetDate && (
                        <p className="text-xs text-gray-500">
                          مهلت: {new Date(goal.targetDate).toLocaleDateString('fa-IR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m6 9l-2-2m0 0l-2 2m2-2v6" />
                  </svg>
                  <p>هیچ هدف فعالی وجود ندارد</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            دسترسی‌های سریع
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              href="/org-chart"
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 text-center">چارت سازمانی</span>
            </Link>

            <Link
              href="/performance"
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 text-center">ارزیابی عملکرد</span>
            </Link>

            <Link
              href="/settings"
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 text-center">تنظیمات</span>
            </Link>

            <Link
              href="/feedback"
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-100 hover:border-pink-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 text-center">صندوق پیشنهادات</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

