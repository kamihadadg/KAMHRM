'use client';

import React, { useState, useEffect } from 'react';
// Icons will be replaced with simple elements
import { useAuth } from '@/contexts/AuthContext';
import {
    getAllPerformanceEvaluations,
    getAllPerformanceGoals,
    getEvaluationStatistics,
} from '@/lib/api';
import {
    type PerformanceEvaluation,
    type PerformanceGoal,
    type EvaluationStatistics,
    EvaluationStatus,
    GoalStatus,
} from '@/types/performance';
import EvaluationCard from '@/components/EvaluationCard';
import GoalCard from '@/components/GoalCard';
import SearchAndPagination from '@/components/SearchAndPagination';

const PerformancePage: React.FC = () => {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
    const [goals, setGoals] = useState<PerformanceGoal[]>([]);
    const [statistics, setStatistics] = useState<EvaluationStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEvaluationForm, setShowEvaluationForm] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [editingEvaluation, setEditingEvaluation] = useState<PerformanceEvaluation | null>(null);
    const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);

    // Search and Pagination
    const [evaluationSearch, setEvaluationSearch] = useState('');
    const [goalSearch, setGoalSearch] = useState('');
    const [evaluationPage, setEvaluationPage] = useState(1);
    const [goalPage, setGoalPage] = useState(1);
    const [evaluationMeta, setEvaluationMeta] = useState<any>(null);
    const [goalMeta, setGoalMeta] = useState<any>(null);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, [user, evaluationPage, evaluationSearch, goalPage, goalSearch]);

    const loadData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Load evaluations for current user
            const evaluationsResponse = await getAllPerformanceEvaluations(
                { page: evaluationPage, limit: itemsPerPage, search: evaluationSearch },
                user.id
            );
            const myEvaluations = evaluationsResponse.data.filter(e => 
                e.employeeId === user.id || e.evaluatorId === user.id
            );
            setEvaluations(myEvaluations);
            setEvaluationMeta({
                ...evaluationsResponse.meta,
                total: myEvaluations.length,
                totalPages: Math.ceil(myEvaluations.length / itemsPerPage)
            });

            // Load goals for current user
            const goalsResponse = await getAllPerformanceGoals(
                { page: goalPage, limit: itemsPerPage, search: goalSearch },
                user.id
            );
            const myGoals = goalsResponse.data.filter(g => g.employeeId === user.id);
            setGoals(myGoals);
            setGoalMeta({
                ...goalsResponse.meta,
                total: myGoals.length,
                totalPages: Math.ceil(myGoals.length / itemsPerPage)
            });

            // Load statistics for current user
            const stats = await getEvaluationStatistics(user.id);
            setStatistics(stats);
        } catch (error) {
            console.error('Error loading performance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluationSave = (savedEvaluation: PerformanceEvaluation) => {
        if (editingEvaluation) {
            setEvaluations(prev =>
                prev.map(evaluation =>
                    evaluation.id === savedEvaluation.id ? savedEvaluation : evaluation
                )
            );
        } else {
            setEvaluations(prev => [savedEvaluation, ...prev]);
        }
        setEditingEvaluation(null);
        setShowEvaluationForm(false);
    };

    const handleGoalSave = (savedGoal: PerformanceGoal) => {
        if (editingGoal) {
            setGoals(prev =>
                prev.map(goal =>
                    goal.id === savedGoal.id ? savedGoal : goal
                )
            );
        } else {
            setGoals(prev => [savedGoal, ...prev]);
        }
        setEditingGoal(null);
        setShowGoalForm(false);
    };

    const handleDeleteEvaluation = (evaluationId: string) => {
        setEvaluations(prev => prev.filter(e => e.id !== evaluationId));
    };

    const handleDeleteGoal = (goalId: string) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const myEvaluations = evaluations;
    const myGoals = goals;

    const pendingEvaluations = evaluations.filter(e =>
        e.evaluatorId === user?.id &&
        e.status === EvaluationStatus.DRAFT
    );

    const activeGoals = goals.filter(g =>
        g.employeeId === user?.id &&
        g.status === GoalStatus.ACTIVE
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">مدیریت عملکرد</h1>
                    <p className="text-gray-600 mt-2">ارزیابی عملکرد و مدیریت اهداف</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowGoalForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                        <span className="text-blue-600">🎯</span>
                        هدف جدید
                    </button>
                    <button
                        onClick={() => setShowEvaluationForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <span className="text-green-600">+</span>
                        ارزیابی جدید
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-600">میانگین امتیاز</h3>
                            <span className="text-gray-400">📈</span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</div>
                            <p className="text-xs text-gray-500">از ۵</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-600">تعداد ارزیابی‌ها</h3>
                            <span className="text-gray-400">👥</span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold">{statistics.totalEvaluations}</div>
                            <p className="text-xs text-gray-500">ارزیابی انجام شده</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-600">اهداف فعال</h3>
                            <span className="text-gray-400">🎯</span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold">{activeGoals.length}</div>
                            <p className="text-xs text-gray-500">در حال پیگیری</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-600">ارزیابی‌های معلق</h3>
                            <span className="text-gray-400">📅</span>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold">{pendingEvaluations.length}</div>
                            <p className="text-xs text-gray-500">نیاز به تکمیل</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="space-y-6">
                {/* Evaluations Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">ارزیابی‌های عملکرد</h2>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {evaluationMeta?.total || myEvaluations.length} ارزیابی
                        </span>
                    </div>

                    {/* Search and Pagination */}
                    <SearchAndPagination
                        searchValue={evaluationSearch}
                        onSearchChange={setEvaluationSearch}
                        searchPlaceholder="جستجو بر اساس دوره یا توضیحات..."
                        currentPage={evaluationPage}
                        totalPages={evaluationMeta?.totalPages || 1}
                        onPageChange={setEvaluationPage}
                        totalItems={evaluationMeta?.total || 0}
                        itemsPerPage={itemsPerPage}
                        showingFrom={evaluationMeta ? (evaluationPage - 1) * itemsPerPage + 1 : 0}
                        showingTo={evaluationMeta ? Math.min(evaluationPage * itemsPerPage, evaluationMeta.total) : 0}
                    />

                    <div className="grid gap-4 mt-4">
                        {myEvaluations.length === 0 ? (
                            <div className="bg-white p-12 rounded-lg shadow text-center">
                                <span className="text-4xl text-gray-400 block text-center mb-4">👥</span>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    ارزیابی‌ای یافت نشد
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    هنوز هیچ ارزیابی عملکردی برای شما ثبت نشده است.
                                </p>
                                <button
                                    onClick={() => setShowEvaluationForm(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    ایجاد ارزیابی جدید
                                </button>
                            </div>
                        ) : (
                            myEvaluations.map((evaluation) => (
                                <EvaluationCard
                                    key={evaluation.id}
                                    evaluation={evaluation}
                                    currentUserId={user?.id || ''}
                                    onEdit={(evaluation) => {
                                        setEditingEvaluation(evaluation);
                                        setShowEvaluationForm(true);
                                    }}
                                    onDelete={handleDeleteEvaluation}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Goals Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">اهداف عملکردی</h2>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {goalMeta?.total || myGoals.length} هدف
                        </span>
                    </div>

                    {/* Search and Pagination */}
                    <SearchAndPagination
                        searchValue={goalSearch}
                        onSearchChange={setGoalSearch}
                        searchPlaceholder="جستجو بر اساس عنوان یا توضیحات هدف..."
                        currentPage={goalPage}
                        totalPages={goalMeta?.totalPages || 1}
                        onPageChange={setGoalPage}
                        totalItems={goalMeta?.total || 0}
                        itemsPerPage={itemsPerPage}
                        showingFrom={goalMeta ? (goalPage - 1) * itemsPerPage + 1 : 0}
                        showingTo={goalMeta ? Math.min(goalPage * itemsPerPage, goalMeta.total) : 0}
                    />

                    <div className="grid gap-4 mt-4">
                        {myGoals.length === 0 ? (
                            <div className="bg-white p-12 rounded-lg shadow text-center">
                                <span className="text-4xl text-gray-400 block text-center mb-4">🎯</span>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    هدف‌ای یافت نشد
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    هنوز هیچ هدف عملکردی برای شما تعریف نشده است.
                                </p>
                                <button
                                    onClick={() => setShowGoalForm(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                >
                                    تعریف هدف جدید
                                </button>
                            </div>
                        ) : (
                            myGoals.map((goal) => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onEdit={(goal) => {
                                        setEditingGoal(goal);
                                        setShowGoalForm(true);
                                    }}
                                    onDelete={handleDeleteGoal}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Forms */}
            {showEvaluationForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-medium mb-4">
                        {editingEvaluation ? 'ویرایش ارزیابی عملکرد' : 'ارزیابی عملکرد جدید'}
                    </h3>
                    <p className="text-gray-600">
                        فرم ارزیابی عملکرد در دست توسعه است. به زودی اضافه خواهد شد.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => {
                                setShowEvaluationForm(false);
                                setEditingEvaluation(null);
                            }}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            انصراف
                        </button>
                    </div>
                </div>
            )}

            {showGoalForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-medium mb-4">
                        {editingGoal ? 'ویرایش هدف عملکردی' : 'هدف عملکردی جدید'}
                    </h3>
                    <p className="text-gray-600">
                        فرم تعریف هدف در دست توسعه است. به زودی اضافه خواهد شد.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => {
                                setShowGoalForm(false);
                                setEditingGoal(null);
                            }}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            انصراف
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformancePage;
