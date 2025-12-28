'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrganizationalChart, resetOrgChartLayout } from '@/lib/api';
import RouteGuard from '@/components/RouteGuard';
import InteractiveOrgChart from '@/components/InteractiveOrgChart';

export default function OrgChartPage() {
    return (
        <RouteGuard requireAuth>
            <OrgChartContent />
        </RouteGuard>
    );
}

function OrgChartContent() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChartData();
    }, []);

    const loadChartData = async (fitToBestView = false) => {
        try {
            setLoading(true);
            const chartData = await getOrganizationalChart();
            setData(chartData);

            // If fitToBestView is true, wait a bit and then fit the view
            if (fitToBestView) {
                setTimeout(() => {
                    // Trigger fit view event on the chart component
                    window.dispatchEvent(new CustomEvent('fitChartView'));
                }, 1000);
            }
        } catch (error) {
            console.error('Error loading org chart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetLayout = async () => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید چیدمان را به حالت پیش‌فرض بازگردانید؟ تمام موقعیت‌های ذخیره شده پاک خواهند شد.')) {
            return;
        }

        try {
            setLoading(true);
            await resetOrgChartLayout();
            alert('چیدمان با موفقیت به حالت پیش‌فرض بازگشت!');
            await loadChartData(true); // Reload chart data with fit view
        } catch (error: any) {
            console.error('Error resetting layout:', error);
            alert(`خطا در بازگشت به چیدمان پیش‌فرض: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-semibold text-gray-900">چارت سازمانی</h1>
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <button
                                onClick={handleResetLayout}
                                className="text-orange-500 hover:text-orange-600 transition-colors"
                                title="بازگشت به چیدمان پیش‌فرض"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button
                                onClick={() => loadChartData(true)}
                                className="text-green-500 hover:text-green-600 transition-colors"
                                title="بهترین نمایش چارت"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => loadChartData()}
                                className="text-gray-500 hover:text-blue-600 transition-colors"
                                title="بازخوانی"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <Link
                                href="/dashboard"
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                بازگشت به داشبورد
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="h-[calc(100vh-64px)] overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : data.length > 0 ? (
                    <div className="h-full w-full p-4">
                        <div className="bg-white shadow-lg rounded-xl h-full overflow-hidden border border-gray-200">
                            <InteractiveOrgChart
                                data={data}
                                readOnly={true}
                                onReorder={async () => { }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="text-4xl mb-4">🏢</div>
                            <h3 className="text-gray-900 font-medium">چارت سازمانی تعریف نشده است</h3>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
