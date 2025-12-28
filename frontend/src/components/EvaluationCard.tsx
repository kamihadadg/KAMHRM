'use client';

import React from 'react';
// Icons will be replaced with simple elements
import { type PerformanceEvaluation, EvaluationStatus, EvaluationType } from '@/types/performance';

interface EvaluationCardProps {
    evaluation: PerformanceEvaluation;
    currentUserId: string;
    onEdit: (evaluation: PerformanceEvaluation) => void;
    onDelete: (evaluationId: string) => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({
    evaluation,
    currentUserId,
    onEdit,
    onDelete,
}) => {
    const isOwner = evaluation.employeeId === currentUserId;
    const isEvaluator = evaluation.evaluatorId === currentUserId;
    const canEdit = isEvaluator && evaluation.status === EvaluationStatus.DRAFT;
    const canDelete = isEvaluator || (currentUserId === 'admin'); // Admin can delete any

    const getStatusColor = (status: EvaluationStatus) => {
        switch (status) {
            case EvaluationStatus.DRAFT:
                return 'bg-gray-100 text-gray-800';
            case EvaluationStatus.SUBMITTED:
                return 'bg-blue-100 text-blue-800';
            case EvaluationStatus.REVIEWED:
                return 'bg-yellow-100 text-yellow-800';
            case EvaluationStatus.APPROVED:
                return 'bg-green-100 text-green-800';
            case EvaluationStatus.REJECTED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: EvaluationType) => {
        switch (type) {
            case EvaluationType.SELF:
                return 'خودارزیابی';
            case EvaluationType.MANAGER:
                return 'ارزیابی مدیر';
            case EvaluationType.PEER:
                return 'ارزیابی همکار';
            case EvaluationType.SUBORDINATE:
                return 'ارزیابی زیردست';
            case EvaluationType.CLIENT:
                return 'ارزیابی مشتری';
            default:
                return type;
        }
    };

    const getStatusLabel = (status: EvaluationStatus) => {
        switch (status) {
            case EvaluationStatus.DRAFT:
                return 'پیش‌نویس';
            case EvaluationStatus.SUBMITTED:
                return 'ارسال شده';
            case EvaluationStatus.REVIEWED:
                return 'بررسی شده';
            case EvaluationStatus.APPROVED:
                return 'تایید شده';
            case EvaluationStatus.REJECTED:
                return 'رد شده';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            {isOwner && <span className="text-blue-600">👤</span>}
                            {evaluation.employee.firstName} {evaluation.employee.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                {evaluation.period}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(evaluation.status)}`}>
                                {getStatusLabel(evaluation.status)}
                            </span>
                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                                {getTypeLabel(evaluation.evaluationType)}
                            </span>
                        </div>
                    </div>

                    {(canEdit || canDelete) && (
                        <div className="flex gap-2">
                            {canEdit && (
                                <button
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                    onClick={() => onEdit(evaluation)}
                                >
                                    <span className="mr-1">✏️</span>
                                    ویرایش
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                                    onClick={() => onDelete(evaluation.id)}
                                >
                                    <span className="mr-1">🗑️</span>
                                    حذف
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* Evaluator Info */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">
                        {evaluation.evaluator.firstName[0]}{evaluation.evaluator.lastName[0]}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">
                            ارزیاب: {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatDate(evaluation.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Rating */}
                {evaluation.overallRating && (
                    <div className="flex items-center gap-2">
                        <span className="text-green-600">📈</span>
                        <span className="text-sm font-medium">امتیاز کلی:</span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`inline-block ${
                                        star <= evaluation.overallRating!
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                >
                                    ⭐
                                </span>
                            ))}
                            <span className="text-sm text-gray-600 ml-2">
                                ({evaluation.overallRating}/5)
                            </span>
                        </div>
                    </div>
                )}

                {/* Period */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-500">📅</span>
                    <span>
                        {formatDate(evaluation.startDate)} - {formatDate(evaluation.endDate)}
                    </span>
                </div>

                {/* Comments Preview */}
                {evaluation.overallComments && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {evaluation.overallComments}
                        </p>
                    </div>
                )}

                {/* Categories Summary */}
                {evaluation.categories && evaluation.categories.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">دسته‌بندی‌ها:</h4>
                        <div className="flex flex-wrap gap-1">
                            {evaluation.categories.slice(0, 3).map((category, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                    {category.name} ({category.weight}%)
                                </span>
                            ))}
                            {evaluation.categories.length > 3 && (
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                    +{evaluation.categories.length - 3} بیشتر
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Strengths and Weaknesses */}
                {(evaluation.strengths || evaluation.weaknesses) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {evaluation.strengths && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <h5 className="text-sm font-medium text-green-800 mb-1">نقاط قوت</h5>
                                <p className="text-xs text-green-700 line-clamp-2">
                                    {evaluation.strengths}
                                </p>
                            </div>
                        )}
                        {evaluation.weaknesses && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <h5 className="text-sm font-medium text-red-800 mb-1">نقاط ضعف</h5>
                                <p className="text-xs text-red-700 line-clamp-2">
                                    {evaluation.weaknesses}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluationCard;
