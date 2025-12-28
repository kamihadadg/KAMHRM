'use client';

import { useState } from 'react';
import { createContract, updateContract } from '@/lib/api';

interface ContractFormModalProps {
    onClose: () => void;
    onSave: () => void;
    users: any[];
    contract?: any; // For editing
}

export default function ContractFormModal({ onClose, onSave, users, contract }: ContractFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: contract?.userId || '',
        startDate: contract?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: contract?.endDate?.split('T')[0] || '',
        contractType: contract?.contractType || 'FULL_TIME',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (contract) {
                // Update existing contract
                await updateContract(contract.id, formData);
            } else {
                // Create new contract
                await createContract(formData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving contract:', error);
            alert('خطا در ذخیره قرارداد');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">
                        {contract ? 'ویرایش قرارداد' : 'ایجاد قرارداد جدید'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            کارمند
                        </label>
                        <select
                            required
                            disabled={!!contract} // Disable in edit mode
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${contract ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        >
                            <option value="">انتخاب کارمند...</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.firstName} {u.lastName} ({u.employeeId})
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
                            <p className="text-xs text-gray-500 mt-1">اختیاری برای قراردادهای دائمی</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            نوع قرارداد
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={formData.contractType}
                            onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                        >
                            <option value="FULL_TIME">تمام وقت (Full Time)</option>
                            <option value="PART_TIME">پاره وقت (Part Time)</option>
                            <option value="CONTRACTOR">پیمانکاری (Contractor)</option>
                            <option value="HOURLY">ساعتی (Hourly)</option>
                        </select>
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
                            {loading ? 'در حال ذخیره...' : (contract ? 'ذخیره تغییرات' : 'ایجاد قرارداد')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
