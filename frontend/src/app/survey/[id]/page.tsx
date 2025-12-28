'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSurveyById, submitSurveyResponse } from '@/lib/api';
import { Survey, QuestionType, SurveyResponse } from '@/types/survey';
import RouteGuard from '@/components/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function SurveyPage() {
    return (
        <RouteGuard requireAuth>
            <SurveyForm />
        </RouteGuard>
    );
}

function SurveyForm() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (params.id) {
            loadSurvey(params.id as string);
        }
    }, [params.id]);

    const loadSurvey = async (id: string) => {
        try {
            setLoading(true);
            const data = await getSurveyById(id);
            setSurvey(data);
        } catch (err) {
            console.error('Failed to load survey', err);
            setError('خطا در بارگذاری نظرسنجی');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!survey) return;

        // Validate required fields
        for (const q of survey.questions) {
            if (q.isRequired && !answers[q.id]) {
                alert(`پاسخ به سوال "${q.question}" الزامی است.`);
                return;
            }
        }

        setSubmitting(true);
        try {
            const responsePayload: SurveyResponse = {
                surveyId: survey.id,
                responses: Object.entries(answers).map(([qId, ans]) => ({
                    questionId: qId,
                    answer: ans
                })),
                userId: isAnonymous ? undefined : user?.id,
                username: isAnonymous ? undefined : user?.username,
                isAnonymous: isAnonymous
            };

            await submitSurveyResponse(responsePayload);
            alert('پاسخ شما با موفقیت ثبت شد.');
            router.push('/dashboard');
        } catch (err) {
            console.error('Failed to submit survey', err);
            alert('خطا در ثبت پاسخ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!survey) return <div className="p-8 text-center">نظرسنجی یافت نشد</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 px-8 py-6">
                    <h1 className="text-2xl font-bold text-white">{survey.title}</h1>
                    {survey.description && <p className="text-blue-100 mt-2">{survey.description}</p>}
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {survey.questions.sort((a, b) => a.order - b.order).map((q, idx) => (
                        <div key={q.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <label className="block text-lg font-medium text-gray-900 mb-4">
                                {idx + 1}. {q.question}
                                {q.isRequired && <span className="text-red-500 mr-1">*</span>}
                            </label>

                            {q.type === QuestionType.TEXT && (
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    value={answers[q.id] || ''}
                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="پاسخ خود را بنویسید..."
                                />
                            )}

                            {(q.type === QuestionType.RADIO || q.type === QuestionType.SELECT) && (
                                <div className="space-y-2">
                                    {q.options ? (() => {
                                        try {
                                            const options = JSON.parse(q.options);
                                            return Array.isArray(options) ? options.map((opt: string) => (
                                                <div key={opt} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id={`${q.id}-${opt}`}
                                                        name={q.id}
                                                        value={opt}
                                                        checked={answers[q.id] === opt}
                                                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                    <label htmlFor={`${q.id}-${opt}`} className="mr-2 block text-sm text-gray-700 cursor-pointer">
                                                        {opt}
                                                    </label>
                                                </div>
                                            )) : null;
                                        } catch (e) {
                                            return <p className="text-red-500 text-sm">خطا در نمایش گزینه‌ها</p>;
                                        }
                                    })() : <p className="text-red-500 text-sm">گزینه‌ای تعریف نشده است</p>}
                                </div>
                            )}

                            {q.type === QuestionType.CHECKBOX && (
                                <div className="text-gray-500 italic">پشتیبانی برای چک‌باکس هنوز فعال نشده است</div>
                            )}
                        </div>
                    ))}

                    <div className="flex items-center justify-between pt-6">
                        <label className="flex items-center space-x-2 space-x-reverse cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-colors"
                            />
                            <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">ارسال به صورت ناشناس</span>
                        </label>

                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="ml-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'در حال ثبت...' : 'ثبت پاسخ‌ها'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
