'use client';

import { useState } from 'react';
import { Survey, SurveyResponse, ResponseAnswer, QuestionType } from '@/types/survey';

interface SurveyFormProps {
  survey: Survey;
  onSubmit: (response: SurveyResponse) => Promise<void>;
  isSubmitting?: boolean;
}

export default function SurveyForm({ survey, onSubmit, isSubmitting = false }: SurveyFormProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const handleInputChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentValue = responses[questionId] || '';
    const options = currentValue ? currentValue.split(',') : [];

    if (checked) {
      options.push(option);
    } else {
      const index = options.indexOf(option);
      if (index > -1) {
        options.splice(index, 1);
      }
    }

    setResponses(prev => ({
      ...prev,
      [questionId]: options.join(',')
    }));

    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    survey.questions.forEach(question => {
      if (question.isRequired && !responses[question.id]?.trim()) {
        newErrors[question.id] = 'این سوال اجباری است';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const responseAnswers: ResponseAnswer[] = survey.questions.map(question => ({
      questionId: question.id,
      answer: responses[question.id] || ''
    }));

    const surveyResponse: SurveyResponse = {
      surveyId: survey.id,
      responses: responseAnswers
    };

    // attach optional user info
    if (isAnonymous === false) {
      surveyResponse.isAnonymous = false;
      if (userId) surveyResponse.userId = userId;
      if (username) surveyResponse.username = username;
    } else {
      surveyResponse.isAnonymous = true;
    }

    try {
      await onSubmit(surveyResponse);
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  const renderQuestionInput = (question: Survey['questions'][0]) => {
    const value = responses[question.id] || '';
    const error = errors[question.id];

    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="پاسخ خود را اینجا بنویسید..."
          />
        );

      case QuestionType.RADIO:
        const radioOptions = question.options ? JSON.parse(question.options) : [];
        return (
          <div className="space-y-2">
            {radioOptions.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.CHECKBOX:
        const checkboxOptions = question.options ? JSON.parse(question.options) : [];
        const selectedOptions = value ? value.split(',') : [];
        return (
          <div className="space-y-2">
            {checkboxOptions.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.SELECT:
        const selectOptions = question.options ? JSON.parse(question.options) : [];
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">انتخاب کنید...</option>
            {selectOptions.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
        {survey.description && (
          <p className="text-gray-600">{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">ارسال به صورت ناشناس</span>
          </label>

          {!isAnonymous && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="نام کاربری (اختیاری)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="شناسه کاربر (اختیاری)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          )}
        </div>

        {survey.questions
          .sort((a, b) => a.order - b.order)
          .map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-lg font-medium text-gray-900">
                {question.question}
                {question.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestionInput(question)}
              {errors[question.id] && (
                <p className="text-red-500 text-sm">{errors[question.id]}</p>
              )}
            </div>
          ))}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'در حال ارسال...' : 'ارسال نظرسنجی'}
          </button>
        </div>
      </form>
    </div>
  );
}
