'use client';

import type { SurveyResults } from '@/types/survey';
import { QuestionType } from '@/types/survey';

interface SurveyResultsProps {
  results: SurveyResults;
}

export default function SurveyResults({ results }: SurveyResultsProps) {
  const getResponseStats = (questionResult: SurveyResults['results'][0]) => {
    if (questionResult.type === QuestionType.TEXT) {
      return null;
    }

    const responseCount: Record<string, number> = {};
    questionResult.responses.forEach(response => {
      const answer = response.answer;
      if (questionResult.type === QuestionType.CHECKBOX) {
        // For checkboxes, split by comma and count each option
        const options = answer.split(',');
        options.forEach(option => {
          if (option.trim()) {
            responseCount[option.trim()] = (responseCount[option.trim()] || 0) + 1;
          }
        });
      } else {
        responseCount[answer] = (responseCount[answer] || 0) + 1;
      }
    });

    return responseCount;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{results.survey.title}</h1>
        {results.survey.description && (
          <p className="text-gray-600 mb-4">{results.survey.description}</p>
        )}
        <div className="text-sm text-gray-500">
          مجموع پاسخ‌ها: {results.totalSubmissions}
        </div>
      </div>

      <div className="space-y-8">
        {results.results.map((questionResult) => {
          const stats = getResponseStats(questionResult);

          return (
            <div key={questionResult.questionId} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {questionResult.question}
              </h3>

                  {questionResult.type === QuestionType.TEXT ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">پاسخ‌ها:</h4>
                  {questionResult.responses.length === 0 ? (
                    <p className="text-gray-500 italic">هنوز پاسخی ثبت نشده است</p>
                  ) : (
                    questionResult.responses.map((response, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">{response.answer || 'پاسخ خالی'}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div>
                                <small>{new Date(response.submittedAt).toLocaleDateString('fa-IR')}</small>
                                {!response.isAnonymous && response.username && (
                                  <div className="text-xs text-gray-600">کاربر: {response.username}</div>
                                )}
                              </div>
                            </div>
                      </div>
                    ))
                  )}
                </div>
              ) : stats ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">آمار پاسخ‌ها:</h4>
                  {Object.keys(stats).length === 0 ? (
                    <p className="text-gray-500 italic">هنوز پاسخی ثبت نشده است</p>
                  ) : (
                    Object.entries(stats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([option, count]) => {
                        const percentage = results.totalSubmissions > 0
                          ? Math.round((count / results.totalSubmissions) * 100)
                          : 0;

                        return (
                          <div key={option} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">{option || 'پاسخ خالی'}</span>
                              <span className="text-gray-500">
                                {count} پاسخ ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">پاسخ‌ها:</h4>
                  {questionResult.responses.length === 0 ? (
                    <p className="text-gray-500 italic">هنوز پاسخی ثبت نشده است</p>
                  ) : (
                    questionResult.responses.map((response, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">{response.answer || 'پاسخ خالی'}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <small>{new Date(response.submittedAt).toLocaleDateString('fa-IR')}</small>
                          {!response.isAnonymous && response.username && (
                            <div className="text-xs text-gray-600">{response.username}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
