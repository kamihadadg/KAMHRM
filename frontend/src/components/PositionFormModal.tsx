'use client';

import { useState } from 'react';
import { createPosition, updatePosition } from '@/lib/api';

interface PositionFormModalProps {
  position?: any;
  positions: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function PositionFormModal({ position, positions, onClose, onSave }: PositionFormModalProps) {
  const [formData, setFormData] = useState({
    title: position?.title || '',
    description: position?.description || '',
    parentPositionId: position?.parentPositionId || '',
    order: position?.order || 0,
    isAggregate: position?.isAggregate || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Remove parentPositionId if it's empty to avoid sending empty strings
      const submitData = {
        ...formData,
        parentPositionId: formData.parentPositionId || undefined,
      };

      if (position) {
        await updatePosition(position.id, submitData);
      } else {
        await createPosition(submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving position:', error);
      alert('خطا در ذخیره سمت');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-800">
            {position ? 'ویرایش جایگاه سازمانی' : 'تعریف جایگاه جدید'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">عنوان جایگاه</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="مثال: مدیر عامل، کارشناس فروش..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">جایگاه بالاتر (سرپرست)</label>
              <div className="relative">
                <select
                  value={formData.parentPositionId}
                  onChange={(e) => setFormData({ ...formData, parentPositionId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                >
                  <option value="">-- بدون جایگاه بالاتر (ریشه) --</option>
                  {positions
                    .filter((p: any) => p.id !== position?.id)
                    .map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">این جایگاه گزارش کار خود را به چه کسی ارائه می‌دهد؟</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">اولیت نمایش</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between group hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, isAggregate: !formData.isAggregate })}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.isAggregate ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-bold transition-colors ${formData.isAggregate ? 'text-blue-800' : 'text-gray-700'}`}>جایگاه تجمیعی</h4>
                  <p className="text-xs text-gray-500 mt-0.5">امکان تخصیص همزمان به چندین نفر (مثل کارشناسان)</p>
                </div>
              </div>

              <div className={`w-14 h-8 flex items-center rounded-full p-1 duration-300 ease-in-out ${formData.isAggregate ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${formData.isAggregate ? '-translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">شرح وظایف سازمانی (Job Description)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                rows={6}
                placeholder="شرح کامل وظایف، مسئولیت‌ها و انتظارات این جایگاه..."
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            {position ? 'ذخیره تغییرات' : 'ایجاد جایگاه'}
          </button>
        </div>

      </div>
    </div>
  );
}
