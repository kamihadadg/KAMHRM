'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  getAllUsers,
  getAllPerformanceEvaluations, 
  getAllPerformanceGoals,
  getEvaluationStatistics,
  getOrganizationalChart
} from '@/lib/api';

export default function MiddleManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'team' | 'performance' | 'personal'>('team');
  const [subordinates, setSubordinates] = useState<any[]>([]);
  const [teamEvaluations, setTeamEvaluations] = useState<any[]>([]);
  const [teamGoals, setTeamGoals] = useState<any[]>([]);
  const [personalStats, setPersonalStats] = useState<any>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [orgChart, setOrgChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Load subordinates from user profile
      if (user.subordinates) {
        setSubordinates(user.subordinates);
      } else {
        // Fallback: try to get from API
        try {
          const allUsers = await getAllUsers({ page: 1, limit: 1000 });
          const mySubordinates = allUsers.data.filter((u: any) => u.managerId === user.id);
          setSubordinates(mySubordinates);
        } catch (error) {
          console.error('Error loading subordinates:', error);
        }
      }

      // Load org chart (read-only)
      try {
        const chartData = await getOrganizationalChart();
        setOrgChart(chartData);
      } catch (error) {
        console.error('Error loading org chart:', error);
      }

      // Load team evaluations
      try {
        const evalResponse = await getAllPerformanceEvaluations({ page: 1, limit: 50 });
        const teamEvals = evalResponse.data.filter((e: any) => 
          subordinates.some((sub: any) => sub.id === e.employeeId) || 
          subordinates.some((sub: any) => sub.id === e.evaluatorId)
        );
        setTeamEvaluations(teamEvals.slice(0, 10));
      } catch (error) {
        console.error('Error loading team evaluations:', error);
      }

      // Load team goals
      try {
        const goalsResponse = await getAllPerformanceGoals({ page: 1, limit: 50 });
        const teamGls = goalsResponse.data.filter((g: any) => 
          subordinates.some((sub: any) => sub.id === g.employeeId)
        );
        setTeamGoals(teamGls.slice(0, 10));
      } catch (error) {
        console.error('Error loading team goals:', error);
      }

      // Load personal statistics
      try {
        const statistics = await getEvaluationStatistics(user.id);
        setPersonalStats(statistics);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }

      // Load personal recent evaluations
      try {
        const evalResponse = await getAllPerformanceEvaluations({ page: 1, limit: 5 }, user.id);
        const myEvals = evalResponse.data.filter((e: any) => 
          e.employeeId === user.id || e.evaluatorId === user.id
        );
        setRecentEvaluations(myEvals.slice(0, 5));
      } catch (error) {
        console.error('Error loading evaluations:', error);
      }

      // Load personal active goals
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar title="داشبورد مدیر میانی" />

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
                {user.position ? `سمت: ${user.position.title}` : 'مدیر میانی'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('team')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                مدیریت تیم ({subordinates.length})
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                ارزیابی عملکرد تیم
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                داشبورد شخصی
              </button>
            </nav>
          </div>
        </div>

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">اعضای تیم</h3>
                <p className="text-3xl font-bold text-gray-900">{subordinates.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">ارزیابی‌های تیم</h3>
                <p className="text-3xl font-bold text-gray-900">{teamEvaluations.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m6 9l-2-2m0 0l-2 2m2-2v6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">اهداف تیم</h3>
                <p className="text-3xl font-bold text-gray-900">{teamGoals.length}</p>
              </div>
            </div>

            {/* Subordinates List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                اعضای تیم
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : subordinates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subordinates.map((subordinate: any) => (
                    <div key={subordinate.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        {subordinate.profileImageUrl ? (
                          <img
                            src={subordinate.profileImageUrl.startsWith('http') ? subordinate.profileImageUrl : `http://192.168.1.112:8081${subordinate.profileImageUrl}`}
                            alt={`${subordinate.firstName} ${subordinate.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">
                              {subordinate.firstName[0]}{subordinate.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{subordinate.firstName} {subordinate.lastName}</p>
                          <p className="text-xs text-gray-500">{subordinate.position?.title || 'کارمند'}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>کد پرسنلی: {subordinate.employeeId}</p>
                        {subordinate.email && <p>ایمیل: {subordinate.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>هیچ عضو تیمی وجود ندارد</p>
                </div>
              )}
            </div>

            {/* Org Chart View (Read-only) */}
            {orgChart.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  چارت سازمانی (فقط مشاهده)
                </h3>
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p>برای مشاهده کامل چارت سازمانی به صفحه "چارت سازمانی" مراجعه کنید</p>
                  <Link href="/org-chart" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
                    مشاهده چارت سازمانی →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Team Evaluations */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  ارزیابی‌های عملکرد تیم
                </h3>
                <Link href="/performance" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  مشاهده همه →
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : teamEvaluations.length > 0 ? (
                <div className="space-y-3">
                  {teamEvaluations.map((evaluation: any) => (
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
                            کارمند: {evaluation.employee?.firstName} {evaluation.employee?.lastName}
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
                  <p>هنوز ارزیابی‌ای برای تیم ثبت نشده است</p>
                </div>
              )}
            </div>

            {/* Team Goals */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  اهداف تیم
                </h3>
                <Link href="/performance" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  مشاهده همه →
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : teamGoals.length > 0 ? (
                <div className="space-y-3">
                  {teamGoals.map((goal: any) => (
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            کارمند: {goal.employee?.firstName} {goal.employee?.lastName}
                          </p>
                        </div>
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
                  <p>هیچ هدفی برای تیم ثبت نشده است</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <PersonnelDashboard />
        )}
      </main>
    </div>
  );
}

function PersonnelDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadPersonalData();
    }
  }, [user]);

  const loadPersonalData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      try {
        const statistics = await getEvaluationStatistics(user.id);
        setStats(statistics);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }

      try {
        const evalResponse = await getAllPerformanceEvaluations({ page: 1, limit: 5 }, user.id);
        const myEvals = evalResponse.data.filter((e: any) => 
          e.employeeId === user.id || e.evaluatorId === user.id
        );
        setRecentEvaluations(myEvals.slice(0, 5));
      } catch (error) {
        console.error('Error loading evaluations:', error);
      }

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
      console.error('Error loading personal data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const daysSinceJoin = user.createdAt 
    ? Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-1">میانگین امتیاز</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.averageScore ? stats.averageScore.toFixed(1) : '-'}
            {stats?.averageScore && <span className="text-lg text-gray-500">/100</span>}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-1">تعداد ارزیابی‌ها</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalEvaluations || recentEvaluations.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-1">اهداف فعال</h3>
          <p className="text-3xl font-bold text-gray-900">{activeGoals.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-1">روزهای کاری</h3>
          <p className="text-3xl font-bold text-gray-900">{daysSinceJoin}</p>
        </div>
      </div>

      {/* Profile Card */}
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
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-500 text-sm mb-2">{user.position?.title || 'مدیر میانی'}</p>
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

      {/* Recent Evaluations */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            ارزیابی‌های اخیر
          </h3>
          <Link href="/performance" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            مشاهده همه →
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
          <Link href="/performance" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            مشاهده همه →
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
            <p>هیچ هدف فعالی وجود ندارد</p>
          </div>
        )}
      </div>
    </div>
  );
}
