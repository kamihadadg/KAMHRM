'use client';

import { useState } from 'react';
import { createAssignment, updateAssignment } from '@/lib/api';

interface AssignmentFormModalProps {
    onClose: () => void;
    onSave: () => void;
    contracts: any[];
    positions: any[];
    assignment?: any; // For editing
}

export default function AssignmentFormModal({ onClose, onSave, contracts, positions, assignment }: AssignmentFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        contractId: assignment?.contractId || '',
        positionId: assignment?.positionId || '',
        startDate: assignment?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: assignment?.endDate?.split('T')[0] || '',
        workloadPercentage: assignment?.workloadPercentage || 100,
        isPrimary: assignment?.isPrimary !== undefined ? assignment.isPrimary : true,
        customJobDescription: assignment?.customJobDescription || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                workloadPercentage: Number(formData.workloadPercentage),
            };

            if (assignment) {
                // Update existing assignment
                await updateAssignment(assignment.id, submitData);
            } else {
                // Create new assignment
                await createAssignment(submitData);
            }
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error saving assignment:', error);
            alert(error.message || 'خطا در ذخیره انتساب شغلی');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">
                        {assignment ? 'ویرایش حکم' : 'انتساب شغل جدید'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            قرارداد (کارمند)
                        </label>
                        <select
                            required
                            disabled={!!assignment}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${assignment ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            value={formData.contractId}
                            onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                        >
                            <option value="">انتخاب قرارداد...</option>
                            {contracts.filter(c => c.status === 'ACTIVE').map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.user?.firstName} {c.user?.lastName} - {new Date(c.startDate).toLocaleDateString('fa-IR')}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">فقط قراردادهای فعال نمایش داده می‌شوند.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            سمت سازمانی
                        </label>
                        <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={formData.positionId}
                            onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                        >
                            <option value="">انتخاب سمت...</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                تاریخ شروع
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                تاریخ پایان
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                درصد اشتغال
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-8"
                                    value={formData.workloadPercentage}
                                    onChange={(e) => setFormData({ ...formData, workloadPercentage: Number(e.target.value) })}
                                />
                                <span className="absolute left-3 top-2 text-gray-400">%</span>
                            </div>
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-offset-0 focus:ring-2 focus:ring-blue-500 transition-all"
                                    checked={formData.isPrimary}
                                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                                />
                                <span className="mr-2 text-sm text-gray-700">شغل اصلی</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            شرح وظایف (اختیاری)
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            value={formData.customJobDescription}
                            onChange={(e) => setFormData({ ...formData, customJobDescription: e.target.value })}
                            placeholder="توضیحات خاص برای این انتساب..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'در حال ذخیره...' : (assignment ? 'ذخیره تغییرات' : 'ایجاد انتساب')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
