'use client';

import { useState } from 'react';

interface PasswordResetModalProps {
  isOpen: boolean;
  userName: string;
  newPassword: string;
  onClose: () => void;
}

export default function PasswordResetModal({ isOpen, userName, newPassword, onClose }: PasswordResetModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = newPassword;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">رمز عبور با موفقیت ریست شد</h3>
                <p className="text-sm text-green-50 mt-0.5">رمز عبور جدید برای {userName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              رمز عبور جدید:
            </label>
            <div className="relative">
              <input
                type="text"
                value={newPassword}
                readOnly
                className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-lg font-mono text-gray-900 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                onClick={handleCopy}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                title="کپی کردن"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                رمز عبور کپی شد!
              </p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">توجه مهم:</p>
                <p className="text-sm text-amber-800">
                  لطفا این رمز عبور را یادداشت کرده و به کاربر اطلاع دهید. این رمز عبور فقط یک بار نمایش داده می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
}

