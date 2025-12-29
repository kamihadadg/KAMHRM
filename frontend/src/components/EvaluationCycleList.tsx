'use client';

import { useState } from 'react';
import { EvaluationCycle, CycleStatus } from '@/lib/api';
import Link from 'next/link';

interface EvaluationCycleListProps {
  cycles: EvaluationCycle[];
  onPublish?: (cycleId: string) => void;
  onRepublish?: (cycleId: string) => void;
  onDelete?: (cycleId: string) => void;
}

const STATUS_COLORS: Record<CycleStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<CycleStatus, string> = {
  DRAFT: 'پیش‌نویس',
  PUBLISHED: 'منتشر شده',
  CLOSED: 'بسته شده',
};

export default function EvaluationCycleList({ cycles, onPublish, onRepublish, onDelete }: EvaluationCycleListProps) {
  if (cycles.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">هیچ دوره ارزیابی‌ای وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cycles.map(cycle => (
        <div key={cycle.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{cycle.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[cycle.status]}`}>
                  {STATUS_LABELS[cycle.status]}
                </span>
              </div>
              
              {cycle.description && (
                <p className="text-gray-600 mb-4">{cycle.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">تمپلیت:</span>
                  <p className="font-medium">{cycle.template?.title || 'نامشخص'}</p>
                </div>
                <div>
                  <span className="text-gray-500">تاریخ شروع:</span>
                  <p className="font-medium">{new Date(cycle.startDate).toLocaleDateString('fa-IR')}</p>
                </div>
                <div>
                  <span className="text-gray-500">تاریخ پایان:</span>
                  <p className="font-medium">{new Date(cycle.endDate).toLocaleDateString('fa-IR')}</p>
                </div>
                {cycle.publishedAt && (
                  <div>
                    <span className="text-gray-500">تاریخ انتشار:</span>
                    <p className="font-medium">{new Date(cycle.publishedAt).toLocaleDateString('fa-IR')}</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <span className="text-gray-500 text-sm">انواع ارزیابی:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {cycle.evaluationTypes.map(type => (
                    <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {type === 'SELF' && 'خود'}
                      {type === 'MANAGER' && 'مدیر'}
                      {type === 'SUBORDINATE' && 'زیرمجموعه'}
                      {type === 'PEER' && 'هم‌ردیف'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mr-4">
              <Link
                href={`/dashboard/evaluation-cycles/${cycle.id}`}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                مشاهده
              </Link>
              
              {cycle.status === 'DRAFT' && onPublish && (
                <button
                  onClick={() => onPublish(cycle.id)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  انتشار
                </button>
              )}

              {cycle.status === 'PUBLISHED' && onRepublish && (
                <button
                  onClick={() => onRepublish(cycle.id)}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  بازنشر
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(cycle.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  حذف
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

