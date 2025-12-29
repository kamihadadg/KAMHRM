'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import RouteGuard from '@/components/RouteGuard';
import SearchAndPagination from '@/components/SearchAndPagination';
import {
  getEvaluationCycleById,
  getCycleEvaluations,
  publishEvaluationCycle,
  republishEvaluationCycle,
  EvaluationCycle,
  PaginationQuery,
} from '@/lib/api';

export default function EvaluationCycleDetailPage() {
  return (
    <RouteGuard requireAuth>
      <EvaluationCycleDetailContent />
    </RouteGuard>
  );
}

function EvaluationCycleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const cycleId = params.id as string;
  
  const [cycle, setCycle] = useState<EvaluationCycle | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    limit: 20,
    search: '',
  });
  const [paginationMeta, setPaginationMeta] = useState<any>(null);

  useEffect(() => {
    loadCycle();
  }, [cycleId]);

  useEffect(() => {
    if (cycleId) {
      loadEvaluations();
    }
  }, [cycleId, pagination.page, pagination.search]);

  const loadCycle = async () => {
    try {
      setLoading(true);
      const data = await getEvaluationCycleById(cycleId);
      setCycle(data);
    } catch (error) {
      console.error('Failed to load cycle:', error);
      alert('خطا در بارگذاری دوره');
      router.push('/dashboard/evaluation-cycles');
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluations = async () => {
    try {
      setLoadingEvaluations(true);
      const response = await getCycleEvaluations(cycleId, pagination);
      setEvaluations(response.data);
      setPaginationMeta(response.meta);
    } catch (error) {
      console.error('Failed to load evaluations:', error);
    } finally {
      setLoadingEvaluations(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('آیا از انتشار این دوره اطمینان دارید؟')) {
      return;
    }

    try {
      const result = await publishEvaluationCycle(cycleId);
      alert(`دوره با موفقیت منتشر شد. ${result.evaluationsCreated} ارزیابی ایجاد شد.`);
      loadCycle();
      loadEvaluations();
    } catch (error: any) {
      alert(error.message || 'خطا در انتشار دوره');
    }
  };

  const handleRepublish = async () => {
    if (!confirm('آیا از بازنشر این دوره اطمینان دارید؟ ارزیابی‌های قبلی حذف خواهند شد.')) {
      return;
    }

    try {
      const result = await republishEvaluationCycle(cycleId);
      alert(`دوره با موفقیت بازنشر شد. ${result.evaluationsCreated} ارزیابی ایجاد شد.`);
      loadCycle();
      loadEvaluations();
    } catch (error: any) {
      alert(error.message || 'خطا در بازنشر دوره');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!cycle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link
                href="/dashboard/evaluation-cycles"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← بازگشت به لیست دوره‌ها
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{cycle.title}</h1>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  cycle.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                  cycle.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {cycle.status === 'DRAFT' && 'پیش‌نویس'}
                  {cycle.status === 'PUBLISHED' && 'منتشر شده'}
                  {cycle.status === 'CLOSED' && 'بسته شده'}
                </span>
              </div>
              {cycle.description && (
                <p className="text-gray-600">{cycle.description}</p>
              )}
            </div>
            <div className="flex gap-2 mr-4">
              {cycle.status === 'DRAFT' && (
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  انتشار دوره
                </button>
              )}
              {cycle.status === 'PUBLISHED' && (
                <button
                  onClick={handleRepublish}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  بازنشر دوره
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <span className="text-gray-500 text-sm">تمپلیت:</span>
              <p className="font-medium">{cycle.template?.title || 'نامشخص'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">تاریخ شروع:</span>
              <p className="font-medium">{new Date(cycle.startDate).toLocaleDateString('fa-IR')}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">تاریخ پایان:</span>
              <p className="font-medium">{new Date(cycle.endDate).toLocaleDateString('fa-IR')}</p>
            </div>
            {cycle.submissionDeadline && (
              <div>
                <span className="text-gray-500 text-sm">مهلت ارسال:</span>
                <p className="font-medium">{new Date(cycle.submissionDeadline).toLocaleDateString('fa-IR')}</p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <span className="text-gray-500 text-sm">انواع ارزیابی:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {cycle.evaluationTypes.map(type => (
                <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {type === 'SELF' && 'ارزیابی خود'}
                  {type === 'MANAGER' && 'ارزیابی توسط مدیر'}
                  {type === 'SUBORDINATE' && 'ارزیابی توسط زیرمجموعه'}
                  {type === 'PEER' && 'ارزیابی توسط هم‌ردیف'}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">لیست ارزیابی‌ها</h2>
          
          {paginationMeta && (
            <div className="mb-4">
              <SearchAndPagination
                searchValue={pagination.search || ''}
                onSearchChange={(value) => setPagination({ ...pagination, search: value, page: 1 })}
                searchPlaceholder="جستجو در ارزیابی‌ها..."
                currentPage={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                onPageChange={(page) => setPagination({ ...pagination, page })}
                totalItems={paginationMeta.total}
                itemsPerPage={paginationMeta.limit}
                showingFrom={(paginationMeta.page - 1) * paginationMeta.limit + 1}
                showingTo={Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total)}
              />
            </div>
          )}
          
          {loadingEvaluations ? (
            <p className="text-gray-500">در حال بارگذاری...</p>
          ) : evaluations.length === 0 ? (
            <p className="text-gray-500">هیچ ارزیابی‌ای وجود ندارد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">پرسنل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ارزیاب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">امتیاز</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {evaluations.map(evaluation => (
                    <tr key={evaluation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.employee?.firstName} {evaluation.employee?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.evaluator?.firstName} {evaluation.evaluator?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.evaluationType === 'SELF' && 'خود'}
                        {evaluation.evaluationType === 'MANAGER' && 'مدیر'}
                        {evaluation.evaluationType === 'SUBORDINATE' && 'زیرمجموعه'}
                        {evaluation.evaluationType === 'PEER' && 'هم‌ردیف'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          evaluation.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          evaluation.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                          evaluation.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                          evaluation.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {evaluation.status === 'DRAFT' && 'پیش‌نویس'}
                          {evaluation.status === 'SUBMITTED' && 'ارسال شده'}
                          {evaluation.status === 'REVIEWED' && 'بررسی شده'}
                          {evaluation.status === 'APPROVED' && 'تایید شده'}
                          {evaluation.status === 'REJECTED' && 'رد شده'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.overallRating ? `${evaluation.overallRating}/5` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

