'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
// Icons will be replaced with simple elements
import { type PerformanceGoal, GoalStatus, GoalPriority, GoalCategory } from '@/types/performance';

interface GoalCardProps {
    goal: PerformanceGoal;
    onEdit: (goal: PerformanceGoal) => void;
    onDelete: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
    const getStatusColor = (status: GoalStatus) => {
        switch (status) {
            case GoalStatus.ACTIVE:
                return 'bg-blue-100 text-blue-800';
            case GoalStatus.COMPLETED:
                return 'bg-green-100 text-green-800';
            case GoalStatus.OVERDUE:
                return 'bg-red-100 text-red-800';
            case GoalStatus.CANCELLED:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: GoalPriority) => {
        switch (priority) {
            case GoalPriority.LOW:
                return 'bg-gray-100 text-gray-800';
            case GoalPriority.MEDIUM:
                return 'bg-yellow-100 text-yellow-800';
            case GoalPriority.HIGH:
                return 'bg-orange-100 text-orange-800';
            case GoalPriority.CRITICAL:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryLabel = (category: GoalCategory) => {
        switch (category) {
            case GoalCategory.INDIVIDUAL:
                return 'فردی';
            case GoalCategory.TEAM:
                return 'تیمی';
            case GoalCategory.DEPARTMENTAL:
                return 'دپارتمانی';
            case GoalCategory.ORGANIZATIONAL:
                return 'سازمانی';
            default:
                return category;
        }
    };

    const getStatusLabel = (status: GoalStatus) => {
        switch (status) {
            case GoalStatus.ACTIVE:
                return 'فعال';
            case GoalStatus.COMPLETED:
                return 'تکمیل شده';
            case GoalStatus.OVERDUE:
                return 'گذشته';
            case GoalStatus.CANCELLED:
                return 'لغو شده';
            default:
                return status;
        }
    };

    const getPriorityLabel = (priority: GoalPriority) => {
        switch (priority) {
            case GoalPriority.LOW:
                return 'کم';
            case GoalPriority.MEDIUM:
                return 'متوسط';
            case GoalPriority.HIGH:
                return 'زیاد';
            case GoalPriority.CRITICAL:
                return 'بحرانی';
            default:
                return priority;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    const isOverdue = new Date(goal.deadline) < new Date() && goal.status === GoalStatus.ACTIVE;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow ${isOverdue ? 'border border-red-300' : ''}`}>
            <div className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <span className="text-blue-600">🎯</span>
                            {goal.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                {getCategoryLabel(goal.category)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(goal.priority)}`}>
                                {getPriorityLabel(goal.priority)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(goal.status)}`}>
                                {getStatusLabel(goal.status)}
                            </span>
                            {isOverdue && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                    <span className="inline mr-1">⚠️</span>
                                    گذشته
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={() => onEdit(goal)}
                        >
                            <span className="mr-1">✏️</span>
                            ویرایش
                        </button>
                        <button
                            className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                            onClick={() => onDelete(goal.id)}
                        >
                            <span className="mr-1">🗑️</span>
                            حذف
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-800">
                        {goal.employee.firstName[0]}{goal.employee.lastName[0]}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">
                            {goal.employee.firstName} {goal.employee.lastName}
                        </p>
                        {goal.setter && (
                            <p className="text-xs text-gray-500">
                                تنظیم‌کننده: {goal.setter.firstName} {goal.setter.lastName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                        {goal.description}
                    </p>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">پیشرفت</span>
                        <span className="text-sm text-gray-600">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    {goal.targetValue && (
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>فعلی: {goal.currentValue || 0}</span>
                            <span>هدف: {goal.targetValue} {goal.unit}</span>
                        </div>
                    )}
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">📅</span>
                    <span className={`${
                        isOverdue ? 'text-red-600 font-medium' :
                        daysLeft <= 7 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                        {isOverdue ? 'گذشته از deadline' : `deadline: ${formatDate(goal.deadline)}`}
                        {!isOverdue && daysLeft <= 7 && (
                            <span className="mr-2">({daysLeft} روز مانده)</span>
                        )}
                    </span>
                </div>

                {/* Measurement Criteria */}
                {goal.measurementCriteria && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-blue-800 mb-1">معیار اندازه‌گیری</h5>
                        <p className="text-xs text-blue-700">
                            {goal.measurementCriteria}
                        </p>
                    </div>
                )}

                {/* Comments */}
                {goal.comments && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {goal.comments}
                        </p>
                    </div>
                )}

                {/* Completion Status */}
                {goal.status === GoalStatus.COMPLETED && goal.completedAt && (
                    <div className="flex items-center gap-2 text-green-600">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm">
                            تکمیل شده در {formatDate(goal.completedAt)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalCard;
