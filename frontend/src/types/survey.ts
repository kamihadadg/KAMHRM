export interface Survey {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  endDate?: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string; // JSON string
  isRequired: boolean;
  order: number;
  createdAt: string;
  surveyId: string;
}

export enum QuestionType {
  TEXT = 'text',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select'
}

export interface SurveyResponse {
  surveyId: string;
  responses: ResponseAnswer[];
  // Optional user info for non-anonymous submissions
  isAnonymous?: boolean;
  userId?: string;
  username?: string;
}

export interface ResponseAnswer {
  questionId: string;
  answer: string;
}

export interface SurveyResults {
  survey: {
    id: string;
    title: string;
    description?: string;
  };
  results: QuestionResult[];
  totalSubmissions: number;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  type: QuestionType;
  totalResponses: number;
  responses: {
    answer: string;
    submittedAt: string;
    isAnonymous?: boolean;
    userId?: string;
    username?: string;
  }[];
}
