'use client';

import { useState } from 'react';
import { HexColorPicker } from "react-colorful";
import { createPosition, updatePosition } from '@/lib/api';

interface PositionFormModalProps {
  position?: any;
  positions: any[];
  onClose: () => void;
  onSave: () => void;
}

// Helper function to convert number to hex color
const numberToHex = (num: number) => {
  return `#${num.toString(16).padStart(6, '0')}`;
};

// Helper function to convert hex color to number
const hexToNumber = (hex: string) => {
  return parseInt(hex.replace('#', ''), 16);
};

// Extensive color palette covering all color ranges
const colorSchemes = [
  // Reds
  { value: 0xdc2626, label: 'قرمز تیره', hex: '#dc2626' },
  { value: 0xef4444, label: 'قرمز', hex: '#ef4444' },
  { value: 0xf87171, label: 'قرمز روشن', hex: '#f87171' },
  { value: 0xfca5a5, label: 'قرمز کم‌رنگ', hex: '#fca5a5' },
  { value: 0xfecaca, label: 'قرمز خیلی کم‌رنگ', hex: '#fecaca' },

  // Oranges
  { value: 0xea580c, label: 'نارنجی تیره', hex: '#ea580c' },
  { value: 0xf97316, label: 'نارنجی', hex: '#f97316' },
  { value: 0xfb923c, label: 'نارنجی روشن', hex: '#fb923c' },
  { value: 0xfdba74, label: 'نارنجی کم‌رنگ', hex: '#fdba74' },
  { value: 0xffedd5, label: 'نارنجی خیلی کم‌رنگ', hex: '#ffedd5' },

  // Yellows
  { value: 0xca8a04, label: 'زرد تیره', hex: '#ca8a04' },
  { value: 0xf59e0b, label: 'زرد-نارنجی', hex: '#f59e0b' },
  { value: 0xfbbf24, label: 'زرد روشن', hex: '#fbbf24' },
  { value: 0xfcd34d, label: 'زرد کم‌رنگ', hex: '#fcd34d' },
  { value: 0xfef3c7, label: 'زرد خیلی کم‌رنگ', hex: '#fef3c7' },

  // Greens
  { value: 0x16a34a, label: 'سبز تیره', hex: '#16a34a' },
  { value: 0x22c55e, label: 'سبز', hex: '#22c55e' },
  { value: 0x4ade80, label: 'سبز روشن', hex: '#4ade80' },
  { value: 0x86efac, label: 'سبز کم‌رنگ', hex: '#86efac' },
  { value: 0xa7f3d0, label: 'سبز خیلی کم‌رنگ', hex: '#a7f3d0' },
  { value: 0x84cc16, label: 'سبز لیمویی', hex: '#84cc16' },
  { value: 0xa3e635, label: 'سبز لیمویی روشن', hex: '#a3e635' },
  { value: 0xd1fae5, label: 'سبز لیمویی کم‌رنگ', hex: '#d1fae5' },

  // Blues
  { value: 0x1e40af, label: 'آبی تیره', hex: '#1e40af' },
  { value: 0x2563eb, label: 'آبی', hex: '#2563eb' },
  { value: 0x3b82f6, label: 'آبی روشن', hex: '#3b82f6' },
  { value: 0x60a5fa, label: 'آبی آسمانی', hex: '#60a5fa' },
  { value: 0x93c5fd, label: 'آبی کم‌رنگ', hex: '#93c5fd' },
  { value: 0xbfdbfe, label: 'آبی خیلی کم‌رنگ', hex: '#bfdbfe' },
  { value: 0xdbeafe, label: 'آبی بسیار کم‌رنگ', hex: '#dbeafe' },

  // Cyans
  { value: 0x0891b2, label: 'فیروزه‌ای تیره', hex: '#0891b2' },
  { value: 0x06b6d4, label: 'فیروزه‌ای', hex: '#06b6d4' },
  { value: 0x22d3ee, label: 'فیروزه‌ای روشن', hex: '#22d3ee' },
  { value: 0x67e8f9, label: 'فیروزه‌ای کم‌رنگ', hex: '#67e8f9' },
  { value: 0xa5f3fc, label: 'فیروزه‌ای خیلی کم‌رنگ', hex: '#a5f3fc' },

  // Teals
  { value: 0x0f766e, label: 'سبز آبی تیره', hex: '#0f766e' },
  { value: 0x14b8a6, label: 'سبز آبی', hex: '#14b8a6' },
  { value: 0x2dd4bf, label: 'سبز آبی روشن', hex: '#2dd4bf' },

  // Purples
  { value: 0x7c3aed, label: 'بنفش تیره', hex: '#7c3aed' },
  { value: 0x8b5cf6, label: 'بنفش', hex: '#8b5cf6' },
  { value: 0xa855f7, label: 'بنفش روشن', hex: '#a855f7' },
  { value: 0xc084fc, label: 'بنفش کم‌رنگ', hex: '#c084fc' },
  { value: 0xe9d5ff, label: 'بنفش خیلی کم‌رنگ', hex: '#e9d5ff' },

  // Violets
  { value: 0x6366f1, label: 'نیلی', hex: '#6366f1' },
  { value: 0x818cf8, label: 'نیلی روشن', hex: '#818cf8' },
  { value: 0xa5b4fc, label: 'نیلی کم‌رنگ', hex: '#a5b4fc' },
  { value: 0xc7d2fe, label: 'نیلی خیلی کم‌رنگ', hex: '#c7d2fe' },

  // Pinks
  { value: 0xdb2777, label: 'گل‌بهی', hex: '#db2777' },
  { value: 0xec4899, label: 'صورتی', hex: '#ec4899' },
  { value: 0xf973d6, label: 'صورتی روشن', hex: '#f973d6' },
  { value: 0xf9a8d4, label: 'صورتی کم‌رنگ', hex: '#f9a8d4' },
  { value: 0xfce7f3, label: 'صورتی خیلی کم‌رنگ', hex: '#fce7f3' },

  // Grays
  { value: 0x111827, label: 'مشکی', hex: '#111827' },
  { value: 0x1f2937, label: 'خاکستری تیره', hex: '#1f2937' },
  { value: 0x374151, label: 'خاکستری', hex: '#374151' },
  { value: 0x4b5563, label: 'خاکستری روشن', hex: '#4b5563' },
  { value: 0x6b7280, label: 'خاکستری متوسط', hex: '#6b7280' },
  { value: 0x9ca3af, label: 'خاکستری کم‌رنگ', hex: '#9ca3af' },
  { value: 0xd1d5db, label: 'خاکستری خیلی کم‌رنگ', hex: '#d1d5db' },
  { value: 0xe5e7eb, label: 'خاکستری بسیار کم‌رنگ', hex: '#e5e7eb' },
  { value: 0xf3f4f6, label: 'خاکستری سفید', hex: '#f3f4f6' },
];

export default function PositionFormModal({ position, positions, onClose, onSave }: PositionFormModalProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);

  const [formData, setFormData] = useState({
    title: position?.title || '',
    description: position?.description || '',
    parentPositionId: position?.parentPositionId || '',
    order: position?.order || 0,
    isAggregate: position?.isAggregate || false,
    colorScheme: position?.colorScheme || 0x3b82f6, // Default blue color as number
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

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 block">رنگ نمایش در چارت سازمانی</label>

              {/* نمایش رنگ فعلی و ابزارها */}
              <div className="flex items-center space-x-4 space-x-reverse">
                <div
                  className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl cursor-pointer transition-all hover:scale-110 hover:shadow-2xl ring-2 ring-gray-200"
                  style={{ backgroundColor: numberToHex(formData.colorScheme) }}
                  onClick={() => setShowColorPalette(!showColorPalette)}
                  title="کلیک کنید تا رنگ را تغییر دهید"
                />
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-mono text-gray-700 font-bold">
                    {numberToHex(formData.colorScheme).toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    رنگ نمایش در چارت
                  </span>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95 font-bold"
                  >
                    {showColorPicker ? '✕ بستن' : '🎨 پیشرفته'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowColorPalette(!showColorPalette)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl active:scale-95 font-bold"
                  >
                    {showColorPalette ? '📦 بستن' : '🎨 پالت'}
                  </button>
                </div>
              </div>

              {/* پالت رنگ‌های آماده */}
              {showColorPalette && (
                <div className="relative z-20">
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-2xl backdrop-blur-sm max-h-80 overflow-y-auto">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">انتخاب از رنگ‌های آماده</h4>
                    <div className="grid grid-cols-10 gap-3 mb-4">
                      {colorSchemes.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, colorScheme: color.value });
                            setShowColorPalette(false);
                          }}
                          className={`relative w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                            formData.colorScheme === color.value
                              ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.label}
                        >
                          {formData.colorScheme === color.value && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowColorPalette(false)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg active:scale-95 font-bold"
                      >
                        ✅ انتخاب شد
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Color Picker پیشرفته */}
              {showColorPicker && (
                <div className="relative z-20">
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-2xl backdrop-blur-sm">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">انتخاب رنگ پیشرفته</h4>
                    <div className="flex justify-center">
                      <HexColorPicker
                        color={numberToHex(formData.colorScheme)}
                        onChange={(color) => {
                          setFormData({ ...formData, colorScheme: hexToNumber(color) });
                        }}
                        className="!w-72 !h-72"
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        رنگ انتخاب شده: <span className="font-mono font-bold">{numberToHex(formData.colorScheme).toUpperCase()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(false)}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95 font-bold"
                      >
                        ✅ تأیید
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">رنگ انتخاب شده برای نمایش این جایگاه در چارت سازمانی استفاده خواهد شد. می‌توانید از پالت رنگ‌های آماده یا انتخاب پیشرفته استفاده کنید.</p>
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
