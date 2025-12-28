'use client';

import { useState, useEffect } from 'react';
import { createEmployeeProfile, updateEmployeeProfile, getEmployeeProfileByUserId } from '@/lib/api';

interface EmployeeProfileFormModalProps {
    onClose: () => void;
    onSave: () => void;
    users: any[];
    employeeProfile?: any; // For editing
    userId?: string; // For creating profile for specific user
}

export default function EmployeeProfileFormModal({
    onClose,
    onSave,
    users,
    employeeProfile,
    userId
}: EmployeeProfileFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(userId || employeeProfile?.userId || '');
    const [existingProfile, setExistingProfile] = useState<any>(null);

    const [formData, setFormData] = useState({
        // Personal Information
        nationalId: employeeProfile?.nationalId || '',
        birthDate: employeeProfile?.birthDate?.split('T')[0] || '',
        birthPlace: employeeProfile?.birthPlace || '',
        gender: employeeProfile?.gender || 'MALE',
        maritalStatus: employeeProfile?.maritalStatus || 'SINGLE',
        childrenCount: employeeProfile?.childrenCount || '',
        militaryStatus: employeeProfile?.militaryStatus || '',

        // Contact Information
        phoneNumber: employeeProfile?.phoneNumber || '',
        emergencyPhone: employeeProfile?.emergencyPhone || '',
        address: employeeProfile?.address || '',
        email: employeeProfile?.email || '',

        // Employment Information
        hireDate: employeeProfile?.hireDate?.split('T')[0] || '',
        employeeId: employeeProfile?.employeeId || '',
        department: employeeProfile?.department || '',
        baseSalary: employeeProfile?.baseSalary || '',
        employmentType: employeeProfile?.employmentType || 'FULL_TIME',

        // Insurance and Tax Information
        insuranceNumber: employeeProfile?.insuranceNumber || '',
        taxCode: employeeProfile?.taxCode || '',
        bankAccountNumber: employeeProfile?.bankAccountNumber || '',
        bankName: employeeProfile?.bankName || '',

        // Education (as JSON string for now)
        education: employeeProfile?.education ? JSON.stringify(employeeProfile.education, null, 2) : '',

        // Previous Jobs (as JSON string for now)
        previousJobs: employeeProfile?.previousJobs ? JSON.stringify(employeeProfile.previousJobs, null, 2) : '',

        // Emergency Contacts (as JSON string for now)
        emergencyContacts: employeeProfile?.emergencyContacts ? JSON.stringify(employeeProfile.emergencyContacts, null, 2) : '',

        // Additional Information
        skills: employeeProfile?.skills || '',
        notes: employeeProfile?.notes || '',

        // Profile Image
        profileImageUrl: employeeProfile?.profileImageUrl || '',

        // Status
        isActive: employeeProfile?.isActive !== undefined ? employeeProfile.isActive : true,
    });

    // Check if user already has a profile when user is selected
    useEffect(() => {
        if (selectedUserId) {
            checkExistingProfile(selectedUserId);
        }
    }, [selectedUserId]);

    const checkExistingProfile = async (userId: string) => {
        try {
            const profile = await getEmployeeProfileByUserId(userId);
            setExistingProfile(profile);
        } catch (error) {
            setExistingProfile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                userId: selectedUserId,
                ...formData,
                childrenCount: formData.childrenCount ? Number(formData.childrenCount) : undefined,
                baseSalary: formData.baseSalary ? Number(formData.baseSalary) : undefined,
                education: formData.education || undefined,
                previousJobs: formData.previousJobs || undefined,
                emergencyContacts: formData.emergencyContacts || undefined,
            };

            console.log('Submitting employee profile data:', submitData);

            if (employeeProfile) {
                // Update existing profile
                await updateEmployeeProfile(employeeProfile.id, submitData);
            } else {
                // Create new profile
                if (existingProfile) {
                    alert('این کاربر قبلاً پروفایل پرسنلی دارد!');
                    return;
                }
                await createEmployeeProfile(submitData);
            }

            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error saving employee profile:', error);
            alert(error.message || 'خطا در ذخیره پروفایل پرسنلی');
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden animate-fade-in-up">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">
                        {employeeProfile ? 'ویرایش پروفایل پرسنلی' : 'ایجاد پروفایل پرسنلی جدید'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* User Selection */}
                    {!employeeProfile && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                انتخاب کاربر
                            </label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                            >
                                <option value="">انتخاب کاربر...</option>
                                {users.filter(u => u.role !== 'ADMIN').map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.employeeId || 'بدون کد پرسنلی'})
                                    </option>
                                ))}
                            </select>
                            {existingProfile && (
                                <p className="text-red-600 text-sm mt-2">
                                    ⚠️ این کاربر قبلاً پروفایل پرسنلی دارد!
                                </p>
                            )}
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">اطلاعات شخصی</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    کد ملی *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.nationalId}
                                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    تاریخ تولد *
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    محل تولد *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.birthPlace}
                                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    جنسیت *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="MALE">مرد</option>
                                    <option value="FEMALE">زن</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    وضعیت تاهل *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.maritalStatus}
                                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                                >
                                    <option value="SINGLE">مجرد</option>
                                    <option value="MARRIED">متاهل</option>
                                    <option value="DIVORCED">طلاق گرفته</option>
                                    <option value="WIDOWED">بیوه</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    تعداد فرزندان
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.childrenCount}
                                    onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">اطلاعات تماس</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    شماره تلفن *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    شماره تلفن اضطراری
                                </label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.emergencyPhone}
                                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    آدرس
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ایمیل
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employment Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">اطلاعات استخدامی</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    تاریخ استخدام *
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.hireDate}
                                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    شماره پرسنلی
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    بخش/دپارتمان
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    حقوق پایه
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.baseSalary}
                                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    نوع استخدام *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                >
                                    <option value="FULL_TIME">تمام وقت</option>
                                    <option value="PART_TIME">پاره وقت</option>
                                    <option value="CONTRACT">قراردادی</option>
                                    <option value="INTERN">کارآموز</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
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
                            {loading ? 'در حال ذخیره...' : (employeeProfile ? 'ذخیره تغییرات' : 'ایجاد پروفایل')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
