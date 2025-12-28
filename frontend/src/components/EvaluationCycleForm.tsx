'use client';

import { useState, useEffect } from 'react';
import { EvaluationCycle, EvaluationTemplate, EvaluationType, CreateEvaluationCycleDto } from '@/lib/api';
import { getEvaluationTemplates } from '@/lib/api';

interface EvaluationCycleFormProps {
  cycle?: EvaluationCycle;
  onSubmit: (dto: CreateEvaluationCycleDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const EVALUATION_TYPES: { value: EvaluationType; label: string }[] = [
  { value: 'SELF', label: 'ارزیابی خود' },
  { value: 'MANAGER', label: 'ارزیابی توسط مدیر مستقیم' },
  { value: 'SUBORDINATE', label: 'ارزیابی توسط زیرمجموعه' },
  { value: 'PEER', label: 'ارزیابی توسط هم‌ردیف' },
];

export default function EvaluationCycleForm({ cycle, onSubmit, onCancel, isSubmitting = false }: EvaluationCycleFormProps) {
  const [title, setTitle] = useState(cycle?.title || '');
  const [description, setDescription] = useState(cycle?.description || '');
  const [templateId, setTemplateId] = useState(cycle?.templateId || '');
  const [startDate, setStartDate] = useState(cycle?.startDate ? cycle.startDate.split('T')[0] : '');
  const [endDate, setEndDate] = useState(cycle?.endDate ? cycle.endDate.split('T')[0] : '');
  const [submissionDeadline, setSubmissionDeadline] = useState(cycle?.submissionDeadline ? cycle.submissionDeadline.split('T')[0] : '');
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>(cycle?.evaluationTypes || []);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await getEvaluationTemplates({ limit: 100 });
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const toggleEvaluationType = (type: EvaluationType) => {
    if (evaluationTypes.includes(type)) {
      setEvaluationTypes(evaluationTypes.filter(t => t !== type));
    } else {
      setEvaluationTypes([...evaluationTypes, type]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'عنوان دوره الزامی است';
    }

    if (!templateId) {
      newErrors.templateId = 'انتخاب تمپلیت الزامی است';
    }

    if (!startDate) {
      newErrors.startDate = 'تاریخ شروع الزامی است';
    }

    if (!endDate) {
      newErrors.endDate = 'تاریخ پایان الزامی است';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'تاریخ پایان باید بعد از تاریخ شروع باشد';
    }

    if (evaluationTypes.length === 0) {
      newErrors.evaluationTypes = 'حداقل یک نوع ارزیابی باید انتخاب شود';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dto: CreateEvaluationCycleDto = {
      title,
      description: description || undefined,
      templateId,
      startDate,
      endDate,
      submissionDeadline: submissionDeadline || undefined,
      evaluationTypes,
    };

    await onSubmit(dto);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان دوره <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="مثلاً: ارزیابی عملکرد نیمه اول ۱۴۰۳"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          توضیحات
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="توضیحات دوره..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تمپلیت ارزیابی <span className="text-red-500">*</span>
        </label>
        {loadingTemplates ? (
          <p className="text-gray-500">در حال بارگذاری تمپلیت‌ها...</p>
        ) : (
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${errors.templateId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">انتخاب تمپلیت</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        )}
        {errors.templateId && <p className="mt-1 text-sm text-red-500">{errors.templateId}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاریخ شروع <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاریخ پایان <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مهلت ارسال
          </label>
          <input
            type="date"
            value={submissionDeadline}
            onChange={(e) => setSubmissionDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          انواع ارزیابی <span className="text-red-500">*</span>
        </label>
        {errors.evaluationTypes && <p className="mb-2 text-sm text-red-500">{errors.evaluationTypes}</p>}
        <div className="space-y-2">
          {EVALUATION_TYPES.map(type => (
            <label key={type.value} className="flex items-center">
              <input
                type="checkbox"
                checked={evaluationTypes.includes(type.value)}
                onChange={() => toggleEvaluationType(type.value)}
                className="ml-2"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            انصراف
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
      </div>
    </form>
  );
}

