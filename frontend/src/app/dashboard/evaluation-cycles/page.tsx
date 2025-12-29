'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import RouteGuard from '@/components/RouteGuard';
import EvaluationCycleForm from '@/components/EvaluationCycleForm';
import EvaluationCycleList from '@/components/EvaluationCycleList';
import {
  getEvaluationCycles,
  createEvaluationCycle,
  publishEvaluationCycle,
  republishEvaluationCycle,
  EvaluationCycle,
  CreateEvaluationCycleDto,
  PaginationQuery,
} from '@/lib/api';
import SearchAndPagination from '@/components/SearchAndPagination';

export default function EvaluationCyclesPage() {
  return (
    <RouteGuard requireAuth>
      <EvaluationCyclesContent />
    </RouteGuard>
  );
}

function EvaluationCyclesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [cycles, setCycles] = useState<EvaluationCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCycle, setEditingCycle] = useState<EvaluationCycle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    limit: 10,
    search: '',
  });
  const [paginationMeta, setPaginationMeta] = useState<any>(null);

  useEffect(() => {
    loadCycles();
  }, [pagination.page, pagination.search]);

  const loadCycles = async () => {
    try {
      setLoading(true);
      const response = await getEvaluationCycles(pagination);
      setCycles(response.data);
      setPaginationMeta(response.meta);
    } catch (error) {
      console.error('Failed to load cycles:', error);
      alert('خطا در بارگذاری دوره‌های ارزیابی');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCycle(null);
    setShowForm(true);
  };

  const handleSubmit = async (dto: CreateEvaluationCycleDto) => {
    try {
      setIsSubmitting(true);
      await createEvaluationCycle(dto);
      alert('دوره ارزیابی با موفقیت ایجاد شد');
      setShowForm(false);
      setEditingCycle(null);
      loadCycles();
    } catch (error: any) {
      console.error('Failed to save cycle:', error);
      alert(error.message || 'خطا در ذخیره دوره');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCycle(null);
  };

  const handlePublish = async (cycleId: string) => {
    if (!confirm('آیا از انتشار این دوره اطمینان دارید؟ ارزیابی‌ها برای پرسنل ایجاد خواهند شد.')) {
      return;
    }

    try {
      const result = await publishEvaluationCycle(cycleId);
      alert(`دوره با موفقیت منتشر شد. ${result.evaluationsCreated} ارزیابی ایجاد شد.`);
      loadCycles();
    } catch (error: any) {
      console.error('Failed to publish cycle:', error);
      alert(error.message || 'خطا در انتشار دوره');
    }
  };

  const handleRepublish = async (cycleId: string) => {
    if (!confirm('آیا از بازنشر این دوره اطمینان دارید؟ ارزیابی‌های قبلی حذف و مجدداً ایجاد خواهند شد.')) {
      return;
    }

    try {
      const result = await republishEvaluationCycle(cycleId);
      alert(`دوره با موفقیت بازنشر شد. ${result.evaluationsCreated} ارزیابی ایجاد شد.`);
      loadCycles();
    } catch (error: any) {
      console.error('Failed to republish cycle:', error);
      alert(error.message || 'خطا در بازنشر دوره');
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4">
            <button
              onClick={handleCancel}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← بازگشت به لیست دوره‌ها
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">ایجاد دوره ارزیابی جدید</h2>
            <EvaluationCycleForm
              cycle={editingCycle || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← بازگشت به پنل مدیریت
          </Link>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">مدیریت دوره‌های ارزیابی</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + ایجاد دوره جدید
          </button>
        </div>

        {paginationMeta && (
          <div className="mb-4">
            <SearchAndPagination
              searchValue={pagination.search || ''}
              onSearchChange={(value) => setPagination({ ...pagination, search: value, page: 1 })}
              searchPlaceholder="جستجو در دوره‌های ارزیابی..."
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

        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">در حال بارگذاری...</p>
            </div>
          ) : (
            <EvaluationCycleList
              cycles={cycles}
              onPublish={handlePublish}
              onRepublish={handleRepublish}
            />
          )}
        </div>
      </div>
    </div>
  );
}

