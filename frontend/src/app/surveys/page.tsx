'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActiveSurveys } from '@/lib/api';
import { Survey } from '@/types/survey';
import RouteGuard from '@/components/RouteGuard';

export default function SurveysPage() {
    return (
        <RouteGuard requireAuth>
            <SurveysContent />
        </RouteGuard>
    );
}

function SurveysContent() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSurveys();
    }, []);

    const loadSurveys = async () => {
        try {
            setLoading(true);
            const data = await getActiveSurveys();
            setSurveys(data);
        } catch (error) {
            console.error('Error loading surveys:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-semibold text-gray-900">نظرسنجی‌ها</h1>
                        <Link
                            href="/dashboard"
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            بازگشت به داشبورد
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : surveys.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {surveys.map((survey) => (
                                <div key={survey.id} className="bg-white shadow rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                فعال
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {survey.endDate ? `تا ${new Date(survey.endDate).toLocaleDateString('fa-IR')}` : 'بدون محدودیت'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{survey.title}</h3>
                                        {survey.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{survey.description}</p>
                                        )}
                                        <Link
                                            href={`/survey/${survey.id}`}
                                            className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            شرکت در نظرسنجی
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900">هیچ نظرسنجی فعالی وجود ندارد</h3>
                            <p className="text-gray-500 mt-2">در حال حاضر نظرسنجی برای شرکت شما موجود نیست.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
