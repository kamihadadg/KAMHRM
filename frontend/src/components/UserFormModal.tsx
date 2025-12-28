'use client';

import { useState, useRef } from 'react';
import { createUser, updateUser, uploadProfileImage, API_BASE_URL } from '@/lib/api';
import { User } from '@/contexts/AuthContext';

const getFullImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path; // handle base64 previews
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

interface UserFormModalProps {
  user?: User | null;
  users: User[];
  positions: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function UserFormModal({ user, users, positions, onClose, onSave }: UserFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImageUrl ? getFullImageUrl(user.profileImageUrl) : null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: user?.employeeId || '',
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: '',
    managerId: user?.manager?.id || '',
    role: user?.role || 'EMPLOYEE',
    profileImageUrl: user?.profileImageUrl || '',
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم فایل نباید بیشتر از 2 مگابایت باشد');
        return;
      }

      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        alert('فقط فایل‌های تصویری (JPG, PNG, GIF) مجاز هستند');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-assign manager when position changes
  const handlePositionChange = (positionId: string) => {
    setFormData(prev => ({ ...prev, positionId }));

    if (positionId) {
      // Find the selected position
      const selectedPosition = positions.find((p: any) => p.id === positionId);

      if (selectedPosition) {
        // Auto-assign manager if position has parent
        if (selectedPosition.parentPositionId) {
          // Find parent position and its employees (potential managers)
          const parentPosition = positions.find((p: any) => p.id === selectedPosition.parentPositionId);
          if (parentPosition && parentPosition.employees && parentPosition.employees.length > 0) {
            // Auto-assign the first employee of parent position as manager
            const autoManagerId = parentPosition.employees[0].id;
            setFormData(prev => ({ ...prev, managerId: autoManagerId }));
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let profileImageUrl = formData.profileImageUrl;

      // Upload image if selected
      if (selectedFile) {
        setUploading(true);
        try {
          const uploadResult = await uploadProfileImage(selectedFile);
          profileImageUrl = uploadResult.fileUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('خطا در آپلود تصویر');
          return;
        } finally {
          setUploading(false);
        }
      }

      // Prepare submit data
      const submitData = {
        ...formData,
        profileImageUrl,
      };

      if (user) {
        await updateUser(user.id, submitData);
      } else {
        await createUser(submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('خطا در ذخیره کاربر');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-800">
            {user ? 'ویرایش اطلاعات کاربر' : 'تعریف کاربر جدید'}
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

            {/* Profile Image Section */}
            <div className="flex flex-col items-center justify-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-blue-50 transition-all group-hover:ring-blue-100">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="پیش نمایش"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-medium">تصویر پروفایل (حداکثر ۲ مگابایت)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">نام</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="نام کوچک"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">نام خانوادگی</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="نام خانوادگی"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">نام کاربری</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none dir-ltr text-right"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">کد پرسنلی</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-center font-mono"
                  required
                />
              </div>
            </div>

            {!user && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">رمز عبور</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none dir-ltr text-right"
                  placeholder="••••••••"
                  required={!user}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">مدیر مستقیم</label>
                <div className="relative">
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">انتخاب کنید...</option>
                    {users
                      .filter((u: User) => u.role === 'MANAGER' || u.role === 'ADMIN')
                      .map((u: User) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">سطح دسترسی</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="EMPLOYEE">کارمند عادی</option>
                    <option value="MANAGER">مدیر</option>
                    <option value="HR">منابع انسانی</option>
                    <option value="ADMIN">مدیر سیستم</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
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
            disabled={uploading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {uploading ? (
              <>
                <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال آپلود...
              </>
            ) : (
              user ? 'ذخیره تغییرات' : 'ایجاد حساب کاربری'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
