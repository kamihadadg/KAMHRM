'use client';

import { useState } from 'react';
import { createSurvey, deleteSurvey } from '@/lib/api';
import { QuestionType } from '@/types/survey';

interface SurveyFormModalProps {
    onClose: () => void;
    onSave: () => void;
}

export default function SurveyFormModal({ onClose, onSave }: SurveyFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Questions array
    const [questions, setQuestions] = useState<any[]>([
        {
            id: "temp-1",
            question: "",
            type: QuestionType.TEXT,
            isRequired: true,
            order: 1,
            options: "" // For storing options as string (newline separated)
        }
    ]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: `temp-${Date.now()}`,
                question: "",
                type: QuestionType.TEXT,
                isRequired: true,
                order: questions.length + 1,
                options: ""
            }
        ]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        // Reorder remaining
        newQuestions.forEach((q, idx) => { q.order = idx + 1; });
        setQuestions(newQuestions);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('عنوان نظرسنجی الزامی است');
            return;
        }

        // Validate questions
        for (const q of questions) {
            if (!q.question.trim()) {
                alert('متن همه سوالات باید وارد شود');
                return;
            }
            if ((q.type === QuestionType.RADIO || q.type === QuestionType.SELECT) && !q.options.trim()) {
                alert('برای سوالات چندگزینه‌ای باید گزینه‌ها را مشخص کنید');
                return;
            }
        }

        setLoading(true);
        try {
            // Format options to JSON string array
            const formattedQuestions = questions.map(q => {
                let optionsJson = undefined;
                if (q.type === QuestionType.RADIO || q.type === QuestionType.SELECT) {
                    const opts = q.options.split('\n').map((o: string) => o.trim()).filter((o: string) => o);
                    optionsJson = JSON.stringify(opts);
                }

                return {
                    question: q.question,
                    type: q.type,
                    isRequired: q.isRequired,
                    order: q.order,
                    options: optionsJson
                };
            });

            const surveyData = {
                title,
                description,
                isActive,
                endDate: endDate ? new Date(endDate).toISOString() : undefined,
                questions: formattedQuestions
            };

            await createSurvey(surveyData);
            onSave();
            onClose();
        } catch (error) {
            console.error('Error creating survey:', error);
            alert('خطا در ایجاد نظرسنجی');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-black text-gray-800">
                        ایجاد نظرسنجی جدید
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">عنوان نظرسنجی</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="مثال: نظرسنجی رضایت شغلی پاییز ۱۴۰۲"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">تاریخ پایان (اختیاری)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="col-span-full space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">توضیحات</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                    rows={2}
                                    placeholder="توضیحات مختصر در مورد هدف نظرسنجی..."
                                />
                            </div>
                            <div className="col-span-full">
                                <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-sm font-bold text-gray-700">این نظرسنجی فعال باشد</span>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-6"></div>

                        {/* Questions Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-gray-800">سوالات نظرسنجی</h4>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center text-sm"
                                >
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    افزودن سوال
                                </button>
                            </div>

                            <div className="space-y-4">
                                {questions.map((q, index) => (
                                    <div key={q.id || index} className="p-5 border border-gray-200 rounded-2xl bg-gray-50 hover:border-blue-200 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                                {index + 1}
                                            </span>
                                            {questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(index)}
                                                    className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-3 space-y-2">
                                                <label className="text-xs font-bold text-gray-600 block">متن سوال</label>
                                                <input
                                                    type="text"
                                                    value={q.question}
                                                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="سوال خود را بنویسید..."
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-600 block">نوع سوال</label>
                                                <select
                                                    value={q.type}
                                                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                                                >
                                                    <option value={QuestionType.TEXT}>متنی (تشریحی)</option>
                                                    <option value={QuestionType.RADIO}>تک‌گزینه‌ای (رادیو)</option>
                                                    <option value={QuestionType.SELECT}>لیست کشویی</option>
                                                </select>
                                            </div>
                                        </div>

                                        {(q.type === QuestionType.RADIO || q.type === QuestionType.SELECT) && (
                                            <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-xs font-bold text-gray-600 block">گزینه‌ها (هر خط یک گزینه)</label>
                                                <textarea
                                                    value={q.options}
                                                    onChange={(e) => updateQuestion(index, 'options', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-24"
                                                    placeholder="گزینه ۱&#10;گزینه ۲&#10;گزینه ۳"
                                                />
                                            </div>
                                        )}

                                        <div className="mt-3 flex items-center">
                                            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={q.isRequired}
                                                    onChange={(e) => updateQuestion(index, 'isRequired', e.target.checked)}
                                                    className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="text-xs font-medium text-gray-600">پاسخ به این سوال الزامی است</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 space-x-reverse flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                    >
                        انصراف
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? 'در حال ایجاد...' : 'ایجاد نظرسنجی'}
                    </button>
                </div>

            </div>
        </div>
    );
}
