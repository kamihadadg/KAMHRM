'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RouteGuard from '@/components/RouteGuard';
import EvaluationTemplateForm from '@/components/EvaluationTemplateForm';
import {
  getEvaluationTemplates,
  createEvaluationTemplate,
  updateEvaluationTemplate,
  deleteEvaluationTemplate,
  EvaluationTemplate,
  CreateEvaluationTemplateDto,
  PaginationQuery,
} from '@/lib/api';
import SearchAndPagination from '@/components/SearchAndPagination';

export default function EvaluationTemplatesPage() {
  return (
    <RouteGuard requireAuth requireRole="ADMIN">
      <EvaluationTemplatesContent />
    </RouteGuard>
  );
}

function EvaluationTemplatesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    limit: 10,
    search: '',
  });

  useEffect(() => {
    loadTemplates();
  }, [pagination.page, pagination.search]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await getEvaluationTemplates(pagination);
      setTemplates(response.data);
      // Update pagination meta if needed
    } catch (error) {
      console.error('Failed to load templates:', error);
      alert('خطا در بارگذاری تمپلیت‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEdit = (template: EvaluationTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این تمپلیت اطمینان دارید؟')) {
      return;
    }

    try {
      await deleteEvaluationTemplate(id);
      loadTemplates();
      alert('تمپلیت با موفقیت حذف شد');
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('خطا در حذف تمپلیت');
    }
  };

  const handleSubmit = async (dto: CreateEvaluationTemplateDto) => {
    try {
      setIsSubmitting(true);
      if (editingTemplate) {
        await updateEvaluationTemplate(editingTemplate.id, dto);
        alert('تمپلیت با موفقیت به‌روزرسانی شد');
      } else {
        await createEvaluationTemplate(dto);
        alert('تمپلیت با موفقیت ایجاد شد');
      }
      setShowForm(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error: any) {
      console.error('Failed to save template:', error);
      alert(error.message || 'خطا در ذخیره تمپلیت');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingTemplate ? 'ویرایش تمپلیت' : 'ایجاد تمپلیت جدید'}
            </h2>
            <EvaluationTemplateForm
              template={editingTemplate || undefined}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">مدیریت تمپلیت‌های ارزیابی</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + ایجاد تمپلیت جدید
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">در حال بارگذاری...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">هیچ تمپلیتی وجود ندارد.</p>
              <button
                onClick={handleCreate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ایجاد اولین تمپلیت
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عنوان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      توضیحات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تعداد دسته‌بندی‌ها
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
                  {templates.map(template => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{template.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {template.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{template.categories.length}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-900 ml-4"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
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

