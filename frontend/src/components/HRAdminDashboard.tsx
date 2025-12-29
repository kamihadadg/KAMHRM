'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllPositions,
  updatePosition,
  deletePosition,
  getOrganizationalChart,
  getAllPositionsFlat,
  updatePositionParent,
  getAllContracts,
  getAllAssignments,
  updateContractStatus,
  getAllEmployeeProfiles,
  deleteContract,
  deleteAssignment,
  resetOrgChartLayout,
  resetUserPassword,
  getCommentsForAdmin
} from '@/lib/api';
import UserFormModal from '@/components/UserFormModal';
import PositionFormModal from '@/components/PositionFormModal';
import InteractiveOrgChart from '@/components/InteractiveOrgChart';
import ContractFormModal from '@/components/ContractFormModal';
import AssignmentFormModal from '@/components/AssignmentFormModal';
import EmployeeProfileFormModal from '@/components/EmployeeProfileFormModal';
import PasswordResetModal from '@/components/PasswordResetModal';
import SearchAndPagination from '@/components/SearchAndPagination';
import { seedTestData, clearTestData, getSeederStats } from '@/lib/api';

interface User {
  id: string;
  employeeId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'PERSONNEL' | 'MIDDLEMANAGER' | 'HRADMIN' | 'SUPERADMIN';
  isActive: boolean;
  position?: {
    id: string;
    title: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  profileImageUrl?: string;
}

export default function HRAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'contracts' | 'employees' | 'performance' | 'comments' | 'users'>('contracts');
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [orgChart, setOrgChart] = useState<any[]>([]);
  const [employeeProfiles, setEmployeeProfiles] = useState<any[]>([]);
  const [flatPositions, setFlatPositions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination Meta
  const [userMeta, setUserMeta] = useState<any>(null);
  const [positionMeta, setPositionMeta] = useState<any>(null);
  const [contractMeta, setContractMeta] = useState<any>(null);
  const [assignmentMeta, setAssignmentMeta] = useState<any>(null);
  const [employeeProfileMeta, setEmployeeProfileMeta] = useState<any>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPosition, setEditingPosition] = useState<any | null>(null);

  // HR State
  const [contracts, setContracts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showEmployeeProfileForm, setShowEmployeeProfileForm] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [editingEmployeeProfile, setEditingEmployeeProfile] = useState<any | null>(null);

  // Seeder State
  const [seederStats, setSeederStats] = useState<any>(null);
  const [seederLoading, setSeederLoading] = useState(false);

  // Password Reset Modal State
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{ userName: string; newPassword: string } | null>(null);

  // Search & Pagination for ALL sections
  const [userSearch, setUserSearch] = useState('');
  const [positionSearch, setPositionSearch] = useState('');
  const [contractSearch, setContractSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [employeeProfileSearch, setEmployeeProfileSearch] = useState('');

  const [userPage, setUserPage] = useState(1);
  const [positionPage, setPositionPage] = useState(1);
  const [contractPage, setContractPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [employeeProfilePage, setEmployeeProfilePage] = useState(1);

  const itemsPerPage = 10;

  if (!user) {
    return null;
  }

  useEffect(() => {
    loadData();
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const commentsData = await getCommentsForAdmin(1000);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Reload data when search or page changes
  useEffect(() => {
    if (userPage || userSearch || positionPage || positionSearch || contractPage || contractSearch || assignmentPage || assignmentSearch || employeeProfilePage || employeeProfileSearch) {
      loadData(true);
    }
  }, [userPage, userSearch, positionPage, positionSearch, contractPage, contractSearch, assignmentPage, assignmentSearch, employeeProfilePage, employeeProfileSearch]);

  const loadSeederStats = async () => {
    try {
      const stats = await getSeederStats();
      setSeederStats(stats.data);
    } catch (error) {
      console.error('Error loading seeder stats:', error);
    }
  };

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [usersResponse, positionsResponse, orgChartData, flatPositionsData, contractsResponse, assignmentsResponse, employeeProfilesResponse] = await Promise.all([
        getAllUsers({ page: userPage, limit: itemsPerPage, search: userSearch }),
        getAllPositions({ page: positionPage, limit: itemsPerPage, search: positionSearch }),
        getOrganizationalChart(),
        getAllPositionsFlat(),
        getAllContracts({ page: contractPage, limit: itemsPerPage, search: contractSearch }),
        getAllAssignments({ page: assignmentPage, limit: itemsPerPage, search: assignmentSearch }),
        getAllEmployeeProfiles({ page: employeeProfilePage, limit: itemsPerPage, search: employeeProfileSearch }),
      ]);
      setUsers(usersResponse.data);
      setUserMeta(usersResponse.meta);
      setPositions(positionsResponse.data);
      setPositionMeta(positionsResponse.meta);
      setOrgChart(orgChartData);
      setFlatPositions(flatPositionsData);
      setContracts(contractsResponse.data);
      setContractMeta(contractsResponse.meta);
      setAssignments(assignmentsResponse.data);
      setAssignmentMeta(assignmentsResponse.meta);
      setEmployeeProfiles(employeeProfilesResponse.data);
      setEmployeeProfileMeta(employeeProfilesResponse.meta);

      // Load seeder stats
      await loadSeederStats();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید داده‌های تستی ایجاد کنید؟ این عملیات ممکن است کمی زمان‌بر باشد.')) {
      return;
    }

    setSeederLoading(true);
    try {
      await seedTestData();
      alert('داده‌های تستی با موفقیت ایجاد شد!');
      await loadData(true); // Reload all data
    } catch (error: any) {
      console.error('Error seeding data:', error);
      alert(`خطا در ایجاد داده‌های تستی: ${error.message}`);
    } finally {
      setSeederLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید تمام داده‌های تستی را پاک کنید؟ این عملیات قابل بازگشت نیست!')) {
      return;
    }

    setSeederLoading(true);
    try {
      await clearTestData();
      alert('داده‌های تستی با موفقیت پاک شد!');
      await loadData(true); // Reload all data
    } catch (error: any) {
      console.error('Error clearing data:', error);
      alert(`خطا در پاک کردن داده‌های تستی: ${error.message}`);
    } finally {
      setSeederLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) return;

    try {
      await deleteUser(userId);
      await loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('خطا در حذف کاربر');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید رمز عبور این کاربر را ریست کنید؟ رمز عبور جدید به صورت خودکار تولید خواهد شد.')) return;

    try {
      const user = users.find(u => u.id === userId);
      const result = await resetUserPassword(userId);
      setResetPasswordData({
        userName: user ? `${user.firstName} ${user.lastName}` : 'کاربر',
        newPassword: result.newPassword
      });
      setShowPasswordResetModal(true);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(`خطا در ریست رمز عبور: ${error.message}`);
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این سمت را حذف کنید؟')) return;

    try {
      await deletePosition(positionId);
      await loadData();
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('خطا در حذف سمت');
    }
  };

  const handleResetLayout = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید چیدمان را به حالت پیش‌فرض بازگردانید؟ تمام موقعیت‌های ذخیره شده پاک خواهند شد.')) {
      return;
    }

    try {
      setLoading(true);
      await resetOrgChartLayout();
      alert('چیدمان با موفقیت به حالت پیش‌فرض بازگشت!');
      await loadData(true); // Reload chart data
    } catch (error: any) {
      console.error('Error resetting layout:', error);
      alert(`خطا در بازگشت به چیدمان پیش‌فرض: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePositionReorder = async (positionId: string, newParentId: string | null) => {
    try {
      await updatePositionParent(positionId, newParentId);
      await loadData(true);
    } catch (error) {
      console.error('Error reordering position:', error);
    }
  };

  const handleCleanupInvalidPositions = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید رکوردهای نامعتبر سمت‌ها را پاک کنید؟')) return;

    try {
      const response = await fetch('/api/auth/admin/debug/cleanup-invalid-positions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('خطا در پاکسازی');
      }

      const result = await response.json();
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error('Error cleaning up positions:', error);
      alert('خطا در پاکسازی رکوردهای نامعتبر');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="داشبورد مدیر منابع انسانی" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('contracts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'contracts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                قراردادها و احکام
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                مدیریت پرسنل ({employeeProfiles.length})
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                ارزیابی عملکرد
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                صندوق انتقادات ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                کاربران (محدود)
              </button>
            </nav>
          </div>
        </div>

        {/* Users Tab - Limited (No SUPERADMIN) */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  لیست کاربران (محدود)
                </h3>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserForm(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  افزودن کاربر جدید
                </button>
              </div>
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ شما نمی‌توانید کاربران با نقش مدیر سیستم (SUPERADMIN) را مشاهده یا مدیریت کنید.
                </p>
              </div>

              {/* Search and Pagination */}
              <SearchAndPagination
                searchValue={userSearch}
                onSearchChange={setUserSearch}
                searchPlaceholder="جستجو بر اساس نام، نام خانوادگی یا کد پرسنلی..."
                currentPage={userPage}
                totalPages={userMeta?.totalPages || 1}
                onPageChange={setUserPage}
                totalItems={userMeta?.total || 0}
                itemsPerPage={itemsPerPage}
                showingFrom={userMeta ? (userPage - 1) * itemsPerPage + 1 : 0}
                showingTo={userMeta ? Math.min(userPage * itemsPerPage, userMeta.total) : 0}
              />

              <div className="overflow-hidden border border-gray-100 rounded-2xl mt-4">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#f8fafc]">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        کاربر
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        کد پرسنلی
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        نقش
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {users.filter(u => u.role !== 'SUPERADMIN').map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profileImageUrl ? (
                                <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `http://192.168.1.112:8081${user.profileImageUrl}`} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold border-2 border-white shadow-sm">
                                  {user.firstName[0]}
                                </div>
                              )}
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-gray-500 font-mono mt-0.5">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-200">{user.employeeId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'SUPERADMIN'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : user.role === 'MIDDLEMANAGER'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : user.role === 'HRADMIN'
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : 'bg-green-50 text-green-700 border-green-100'
                            }`}>
                            {user.role === 'SUPERADMIN' ? 'مدیر سیستم' :
                              user.role === 'MIDDLEMANAGER' ? 'مدیر میانی' :
                                user.role === 'HRADMIN' ? 'مدیر منابع انسانی' : 'پرسنل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setShowUserForm(true);
                              }}
                              className="group p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                              title="ویرایش"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="group p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100"
                              title="ریست رمز عبور"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </button>
                            {user.role !== 'SUPERADMIN' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="group p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                title="حذف"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.filter(u => u.role !== 'SUPERADMIN').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 bg-gray-50">
                          {userSearch ? 'نتیجه‌ای یافت نشد.' : 'هیچ کاربری ثبت نشده است.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* Positions, Org Chart, and Surveys Tabs - Removed for HRAdmin */}
        {showUserForm && (
          <UserFormModal
            user={editingUser}
            users={users}
            positions={positions}
            onClose={() => {
              setShowUserForm(false);
              setEditingUser(null);
            }}
            onSave={loadData}
          />
        )}

        {/* Position Form Modal */}
        {showPositionForm && (
          <PositionFormModal
            position={editingPosition}
            positions={positions}
            onClose={() => {
              setShowPositionForm(false);
              setEditingPosition(null);
            }}
            onSave={loadData}
          />
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {/* Contracts Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      لیست قراردادها
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">مدیریت قراردادهای کاری پرسنل</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingContract(null);
                      setShowContractForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span className="text-xl font-bold">+</span>
                    قرارداد جدید
                  </button>
                </div>

                {/* Search and Pagination */}
                <SearchAndPagination
                  searchValue={contractSearch}
                  onSearchChange={setContractSearch}
                  searchPlaceholder="جستجو بر اساس نام کارمند..."
                  currentPage={contractPage}
                  totalPages={contractMeta?.totalPages || 1}
                  onPageChange={setContractPage}
                  totalItems={contractMeta?.total || 0}
                  itemsPerPage={itemsPerPage}
                  showingFrom={contractMeta ? (contractPage - 1) * itemsPerPage + 1 : 0}
                  showingTo={contractMeta ? Math.min(contractPage * itemsPerPage, contractMeta.total) : 0}
                />

                <div className="overflow-hidden border border-gray-100 rounded-2xl mt-4">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-[#f8fafc]">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">کارمند</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">نوع</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاریخ شروع</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاریخ پایان</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">وضعیت</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {contracts.map((contract) => (
                          <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{contract.employee?.firstName} {contract.employee?.lastName}</div>
                              <div className="text-xs text-gray-500">{contract.employee?.employeeId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {contract.contractType === 'FULL_TIME' ? 'تمام وقت' :
                                contract.contractType === 'PART_TIME' ? 'پاره وقت' :
                                  contract.contractType === 'CONTRACTOR' ? 'پیمانی' : 'ساعتی'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(contract.startDate).toLocaleDateString('fa-IR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {contract.endDate ? new Date(contract.endDate).toLocaleDateString('fa-IR') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-bold rounded-md ${contract.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-100' :
                                contract.status === 'DRAFT' ? 'bg-gray-50 text-gray-700 border border-gray-100' :
                                  contract.status === 'SUSPENDED' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                    'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {contract.status === 'ACTIVE' ? 'فعال' :
                                  contract.status === 'DRAFT' ? 'پیش‌نویس' :
                                    contract.status === 'SUSPENDED' ? 'معلق' :
                                      contract.status === 'TERMINATED' ? 'خاتمه یافته' : 'منقضی شده'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingContract(contract);
                                    setShowContractForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                                  title="ویرایش"
                                >
                                  ویرایش
                                </button>
                                {contract.status === 'DRAFT' && (
                                  <button
                                    onClick={async () => {
                                      if (confirm('آیا از فعال‌سازی این قرارداد اطمینان دارید؟')) {
                                        await updateContractStatus(contract.id, 'ACTIVE');
                                        loadData(true);
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                                  >
                                    فعال‌سازی
                                  </button>
                                )}
                                {contract.status === 'ACTIVE' && (
                                  <>
                                    <button
                                      onClick={async () => {
                                        if (confirm('آیا از تعلیق این قرارداد اطمینان دارید؟')) {
                                          await updateContractStatus(contract.id, 'SUSPENDED');
                                          loadData(true);
                                        }
                                      }}
                                      className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded text-xs"
                                    >
                                      تعلیق
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm('آیا از خاتمه این قرارداد اطمینان دارید؟')) {
                                          await updateContractStatus(contract.id, 'TERMINATED');
                                          loadData(true);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                                    >
                                      خاتمه
                                    </button>
                                  </>
                                )}
                                {contract.status === 'SUSPENDED' && (
                                  <button
                                    onClick={async () => {
                                      if (confirm('آیا از فعال‌سازی مجدد این قرارداد اطمینان دارید؟')) {
                                        await updateContractStatus(contract.id, 'ACTIVE');
                                        loadData(true);
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                                  >
                                    فعال‌سازی مجدد
                                  </button>
                                )}
                                {contract.status === 'DRAFT' && (
                                  <button
                                    onClick={async () => {
                                      if (confirm('آیا از حذف این قرارداد اطمینان دارید؟')) {
                                        await deleteContract(contract.id);
                                        loadData(true);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                                  >
                                    حذف
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      {contracts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-gray-500 bg-gray-50">
                              {contractSearch ? 'نتیجه‌ای یافت نشد.' : 'هیچ قراردادی ثبت نشده است.'}
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Assignments Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    لیست انتساب‌های شغلی (احکام)
                  </h3>
                  <button
                    onClick={() => {
                      setEditingAssignment(null);
                      setShowAssignmentForm(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <span className="text-xl font-bold">+</span>
                    انتساب شغل جدید
                  </button>
                </div>

                {/* Search and Pagination */}
                <SearchAndPagination
                  searchValue={assignmentSearch}
                  onSearchChange={setAssignmentSearch}
                  searchPlaceholder="جستجو بر اساس نام کارمند یا سمت..."
                  currentPage={assignmentPage}
                  totalPages={assignmentMeta?.totalPages || 1}
                  onPageChange={setAssignmentPage}
                  totalItems={assignmentMeta?.total || 0}
                  itemsPerPage={itemsPerPage}
                  showingFrom={assignmentMeta ? (assignmentPage - 1) * itemsPerPage + 1 : 0}
                  showingTo={assignmentMeta ? Math.min(assignmentPage * itemsPerPage, assignmentMeta.total) : 0}
                />

                <div className="overflow-hidden border border-gray-100 rounded-2xl mt-4">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-[#f8fafc]">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">قرارداد</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">سمت</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاریخ شروع</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">درصد کار</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">وضعیت</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {assignment.contract?.employee?.firstName} {assignment.contract?.employee?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              قرارداد: {new Date(assignment.contract?.startDate).toLocaleDateString('fa-IR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {assignment.position?.title}
                            {assignment.isPrimary && <span className="mr-2 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">اصلی</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(assignment.startDate).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-bold text-gray-700 ml-2">{assignment.workloadPercentage}%</span>
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${assignment.workloadPercentage}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* Simple logic for status based on dates */}
                            {(!assignment.endDate || new Date(assignment.endDate) > new Date()) ?
                              <span className="text-xs font-bold text-green-600">فعال</span> :
                              <span className="text-xs font-bold text-gray-400">پایان یافته</span>
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingAssignment(assignment);
                                  setShowAssignmentForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                                title="ویرایش"
                              >
                                ویرایش
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('آیا از حذف این حکم اطمینان دارید؟')) {
                                    await deleteAssignment(assignment.id);
                                    loadData(true);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {assignments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500 bg-gray-50">
                            {assignmentSearch ? 'نتیجه‌ای یافت نشد.' : 'هیچ انتساب شغلی ثبت نشده است.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      {showContractForm && (
        <ContractFormModal
          onClose={() => {
            setShowContractForm(false);
            setEditingContract(null);
          }}
          onSave={() => {
            console.log('🔄 AdminPage - Assignment onSave triggered');
            loadData(true);
          }}
          users={users}
          contract={editingContract}
        />
      )}

      {showAssignmentForm && (
        <AssignmentFormModal
          onClose={() => {
            setShowAssignmentForm(false);
            setEditingAssignment(null);
          }}
          onSave={() => {
            console.log('🔄 AdminPage - Assignment onSave triggered');
            loadData(true);
          }}
          contracts={contracts}
          positions={positions}
          assignment={editingAssignment}
        />
      )}

      {/* Employee Profile Form Modal */}
      {showEmployeeProfileForm && (
        <EmployeeProfileFormModal
          onClose={() => {
            setShowEmployeeProfileForm(false);
            setEditingEmployeeProfile(null);
          }}
          onSave={() => {
            console.log('🔄 AdminPage - EmployeeProfile onSave triggered');
            loadData(true);
          }}
          users={users}
          employeeProfile={editingEmployeeProfile}
        />
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Employee Profiles Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    لیست پرسنل
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">مدیریت پروفایل‌های پرسنلی</p>
                </div>
                <button
                  onClick={() => setShowEmployeeProfileForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  افزودن پرسنل جدید
                </button>
              </div>

              {/* Search and Pagination */}
              <SearchAndPagination
                searchValue={employeeProfileSearch}
                onSearchChange={setEmployeeProfileSearch}
                searchPlaceholder="جستجو بر اساس نام، نام خانوادگی، کد ملی یا شماره پرسنلی..."
                currentPage={employeeProfilePage}
                totalPages={employeeProfileMeta?.totalPages || 1}
                onPageChange={setEmployeeProfilePage}
                totalItems={employeeProfileMeta?.total || 0}
                itemsPerPage={itemsPerPage}
                showingFrom={employeeProfileMeta ? (employeeProfilePage - 1) * itemsPerPage + 1 : 0}
                showingTo={employeeProfileMeta ? Math.min(employeeProfilePage * itemsPerPage, employeeProfileMeta.total) : 0}
              />

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نام و نام خانوادگی
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کد ملی
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        شماره پرسنلی
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        بخش
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeeProfiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {profile.user?.firstName} {profile.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{profile.user?.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {profile.nationalId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {profile.employeeId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {profile.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {profile.isActive ? (
                            <span className="text-xs font-bold text-green-600">فعال</span>
                          ) : (
                            <span className="text-xs font-bold text-red-600">غیرفعال</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingEmployeeProfile(profile);
                              setShowEmployeeProfileForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('آیا از حذف این پروفایل پرسنلی اطمینان دارید؟')) {
                                // deleteEmployeeProfile(profile.id).then(() => loadData(true));
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                    {employeeProfiles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          {employeeProfileSearch ? 'نتیجه‌ای یافت نشد.' : 'هیچ پروفایل پرسنلی یافت نشد. برای شروع، دکمه "افزودن پرسنل جدید" را کلیک کنید.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                مدیریت ارزیابی عملکرد
              </h3>
              <div className="flex gap-2">
                <Link href="/performance" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  مشاهده عملکرد من
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Templates Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">تمپلیت‌های ارزیابی</h4>
                    <p className="text-sm text-gray-600">مدیریت ساختار سوالات و دسته‌بندی‌ها</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  ایجاد و مدیریت تمپلیت‌های ارزیابی با دسته‌بندی‌ها و سوالات مختلف برای استفاده در دوره‌های ارزیابی
                </p>
                <Link
                  href="/dashboard/evaluation-templates"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  مدیریت تمپلیت‌ها →
                </Link>
              </div>

              {/* Cycles Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">دوره‌های ارزیابی</h4>
                    <p className="text-sm text-gray-600">ایجاد و مدیریت دوره‌های ارزیابی</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  ایجاد دوره‌های ارزیابی، انتخاب تمپلیت، تعیین انواع نشر و انتشار خودکار ارزیابی‌ها برای پرسنل
                </p>
                <Link
                  href="/dashboard/evaluation-cycles"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  مدیریت دوره‌ها →
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    راهنمای استفاده از سیستم ارزیابی عملکرد
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 space-y-2">
                    <p>
                      <strong>مرحله 1:</strong> ابتدا یک تمپلیت ارزیابی با دسته‌بندی‌ها و سوالات ایجاد کنید
                    </p>
                    <p>
                      <strong>مرحله 2:</strong> یک دوره ارزیابی ایجاد کرده و تمپلیت را انتخاب کنید
                    </p>
                    <p>
                      <strong>مرحله 3:</strong> انواع ارزیابی را انتخاب کنید (خود، مدیر، زیرمجموعه، هم‌ردیف)
                    </p>
                    <p>
                      <strong>مرحله 4:</strong> دوره را منتشر کنید تا ارزیابی‌ها خودکار برای پرسنل ایجاد شوند
                    </p>
                    <p>
                      <strong>نکته:</strong> می‌توانید دوره را بازنشر کنید تا ارزیابی‌های جدید ایجاد شوند
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  صندوق انتقادات و پیشنهادات
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  مشاهده نظرات و پیشنهادات ثبت شده توسط کاربران
                </p>
              </div>
              <button
                onClick={loadComments}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                به‌روزرسانی
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">تعداد کل نظرات: {comments.length}</p>
                  <p className="text-xs text-blue-600 mt-1">این نظرات به صورت ناشناس ثبت شده‌اند</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-500">
                            {comment.name || 'ناشناس'}
                          </span>
                          <span className="text-xs text-gray-400 mr-3">
                            • {new Date(comment.createdAt).toLocaleDateString('fa-IR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-900 whitespace-pre-wrap">{comment.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500">هنوز نظری ثبت نشده است.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seeder Tab - Removed for HRAdmin */}
      {false && activeTab === 'seeder' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  مدیریت داده‌های تستی
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  ایجاد و پاک کردن داده‌های آزمایشی برای تست سیستم
                </p>
              </div>
            </div>

            {/* Statistics */}
            {seederStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{seederStats.positions}</div>
                  <div className="text-sm text-blue-800">سمت‌ها</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{seederStats.users}</div>
                  <div className="text-sm text-green-800">کاربران</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{seederStats.profiles}</div>
                  <div className="text-sm text-yellow-800">پروفایل‌ها</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{seederStats.goals}</div>
                  <div className="text-sm text-purple-800">اهداف</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{seederStats.evaluations}</div>
                  <div className="text-sm text-red-800">ارزیابی‌ها</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-green-800 mb-2">
                  ایجاد داده‌های تستی
                </h4>
                <p className="text-sm text-green-700 mb-4">
                  این عملیات 100 پرسنل، 20 سمت، اهداف عملکردی و ارزیابی‌های نمونه ایجاد می‌کند.
                </p>
                <button
                  onClick={handleSeedData}
                  disabled={seederLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {seederLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  ایجاد داده‌های تستی
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-red-800 mb-2">
                  پاک کردن داده‌های تستی
                </h4>
                <p className="text-sm text-red-700 mb-4">
                  این عملیات تمام داده‌های تستی را پاک می‌کند. این عملیات قابل بازگشت نیست!
                </p>
                <button
                  onClick={handleClearData}
                  disabled={seederLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {seederLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  پاک کردن داده‌های تستی
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-blue-800 mb-2">
                  اطلاعات مفید
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• کاربران تستی: نام کاربری user001 تا user100، رمز عبور: password123</li>
                  <li>• داده‌های تستی با پیشوند "تستی" یا "نمونه" مشخص می‌شوند</li>
                  <li>• عملیات seeding ممکن است چند دقیقه طول بکشد</li>
                  <li>• همیشه ابتدا داده‌ها را backup بگیرید</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && resetPasswordData && (
        <PasswordResetModal
          isOpen={showPasswordResetModal}
          userName={resetPasswordData.userName}
          newPassword={resetPasswordData.newPassword}
          onClose={() => {
            setShowPasswordResetModal(false);
            setResetPasswordData(null);
          }}
        />
      )}
    </div>
  );
}
