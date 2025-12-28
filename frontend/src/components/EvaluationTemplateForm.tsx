'use client';

import { useState, useEffect } from 'react';
import { EvaluationTemplate, EvaluationCategory, EvaluationCriterion, CreateEvaluationTemplateDto } from '@/lib/api';

interface EvaluationTemplateFormProps {
  template?: EvaluationTemplate;
  onSubmit: (dto: CreateEvaluationTemplateDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function EvaluationTemplateForm({ template, onSubmit, onCancel, isSubmitting = false }: EvaluationTemplateFormProps) {
  const [title, setTitle] = useState(template?.title || '');
  const [description, setDescription] = useState(template?.description || '');
  const [categories, setCategories] = useState<EvaluationCategory[]>(template?.categories || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addCategory = () => {
    setCategories([...categories, {
      name: '',
      description: '',
      weight: 1.0,
      criteria: [],
    }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: keyof EvaluationCategory, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const addCriterion = (categoryIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].criteria.push({
      title: '',
      description: '',
    });
    setCategories(updated);
  };

  const removeCriterion = (categoryIndex: number, criterionIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].criteria = updated[categoryIndex].criteria.filter((_, i) => i !== criterionIndex);
    setCategories(updated);
  };

  const updateCriterion = (categoryIndex: number, criterionIndex: number, field: keyof EvaluationCriterion, value: any) => {
    const updated = [...categories];
    updated[categoryIndex].criteria[criterionIndex] = {
      ...updated[categoryIndex].criteria[criterionIndex],
      [field]: value,
    };
    setCategories(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'عنوان تمپلیت الزامی است';
    }

    if (categories.length === 0) {
      newErrors.categories = 'حداقل یک دسته‌بندی الزامی است';
    }

    categories.forEach((category, catIndex) => {
      if (!category.name.trim()) {
        newErrors[`category_${catIndex}_name`] = 'نام دسته‌بندی الزامی است';
      }
      if (category.criteria.length === 0) {
        newErrors[`category_${catIndex}_criteria`] = 'حداقل یک معیار الزامی است';
      }
      category.criteria.forEach((criterion, critIndex) => {
        if (!criterion.title.trim()) {
          newErrors[`category_${catIndex}_criterion_${critIndex}_title`] = 'عنوان معیار الزامی است';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dto: CreateEvaluationTemplateDto = {
      title,
      description: description || undefined,
      categories,
      isActive: true,
    };

    await onSubmit(dto);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان تمپلیت <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="مثلاً: ارزیابی عملکرد فصلی"
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
          placeholder="توضیحات تمپلیت..."
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            دسته‌بندی‌ها و معیارها <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addCategory}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            + افزودن دسته‌بندی
          </button>
        </div>
        {errors.categories && <p className="mb-2 text-sm text-red-500">{errors.categories}</p>}

        <div className="space-y-4">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="border border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(catIndex, 'name', e.target.value)}
                      placeholder="نام دسته‌بندی (مثلاً: کیفیت کار)"
                      className={`w-full px-3 py-2 border rounded-md ${errors[`category_${catIndex}_name`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors[`category_${catIndex}_name`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`category_${catIndex}_name`]}</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      value={category.description || ''}
                      onChange={(e) => updateCategory(catIndex, 'description', e.target.value)}
                      placeholder="توضیحات دسته‌بندی..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm text-gray-600">وزن:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={category.weight || 1.0}
                        onChange={(e) => updateCategory(catIndex, 'weight', parseFloat(e.target.value))}
                        className="w-20 ml-2 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addCriterion(catIndex)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      + افزودن معیار
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(catIndex)}
                  className="mr-3 text-red-600 hover:text-red-800"
                >
                  حذف
                </button>
              </div>

              {errors[`category_${catIndex}_criteria`] && (
                <p className="mb-2 text-sm text-red-500">{errors[`category_${catIndex}_criteria`]}</p>
              )}

              <div className="space-y-2 mr-4">
                {category.criteria.map((criterion, critIndex) => (
                  <div key={critIndex} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={criterion.title}
                        onChange={(e) => updateCriterion(catIndex, critIndex, 'title', e.target.value)}
                        placeholder="عنوان معیار (مثلاً: دقت در کار)"
                        className={`w-full px-3 py-2 border rounded-md ${errors[`category_${catIndex}_criterion_${critIndex}_title`] ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors[`category_${catIndex}_criterion_${critIndex}_title`] && (
                        <p className="mt-1 text-sm text-red-500">{errors[`category_${catIndex}_criterion_${critIndex}_title`]}</p>
                      )}
                      <textarea
                        value={criterion.description || ''}
                        onChange={(e) => updateCriterion(catIndex, critIndex, 'description', e.target.value)}
                        placeholder="توضیحات معیار..."
                        rows={1}
                        className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(catIndex, critIndex)}
                      className="text-red-600 hover:text-red-800 mt-2"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
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

