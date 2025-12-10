// TypeScript types for the Survey application

export type QuestionType = 
  | 'SHORT_ANSWER'
  | 'PARAGRAPH'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'DROPDOWN'
  | 'DATE'
  | 'TIME'
  | 'LINEAR_SCALE';

export type AnswerType = 'TEXT' | 'SELECTION' | 'NUMERIC' | 'DATE' | 'TIME';

export interface LinearScaleConfig {
  minValue: number;
  maxValue: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export interface QuestionOption {
  id?: string;
  label: string;
  orderIndex?: number;
}

export interface Question {
  id?: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  maxLength?: number;
  linearScaleConfig?: LinearScaleConfig;
  options?: QuestionOption[];
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SurveyQuestionLink {
  id?: string;
  surveyId?: string;
  questionId?: string;
  orderIndex: number;
  requiredOverride?: boolean | null;
  labelOverride?: string | null;
  descriptionOverride?: string | null;
  hidden: boolean;
  effectiveLabel?: string;
  effectiveDescription?: string;
  effectivelyRequired?: boolean;
  questionType?: QuestionType;
  question?: Question;
  createdAt?: string;
  updatedAt?: string;
}

export interface Survey {
  id?: string;
  title: string;
  description?: string;
  published: boolean;
  archived?: boolean;
  questionLinks?: SurveyQuestionLink[];
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSurveyQuestionLink {
  questionId: string;
  orderIndex?: number;
  requiredOverride?: boolean | null;
  labelOverride?: string | null;
  descriptionOverride?: string | null;
  hidden?: boolean;
}

export interface UpdateSurveyQuestionLink {
  orderIndex?: number;
  requiredOverride?: boolean | null;
  labelOverride?: string | null;
  descriptionOverride?: string | null;
  hidden?: boolean;
}

export interface QuestionResponse {
  id?: string;
  questionId: string;
  textAnswer?: string;
  selectedOptionIds?: string[];
  numericAnswer?: number;
}

export interface SubmitSurveyResponse {
  surveyId: string;
  submitterId?: string;
  answers: QuestionResponse[];
}

export interface SelectedOption {
  optionId: string;
  label: string;
}

export interface QuestionResponseDetail {
  id: string;
  questionId: string;
  questionTitle?: string;
  answerType: AnswerType;
  textAnswer?: string;
  numericAnswer?: number;
  selectedOptions?: SelectedOption[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  submittedAt: string;
  submitterId?: string;
  answers?: QuestionResponseDetail[];
}

export interface SurveyResponseSummary {
  id: string;
  surveyId: string;
  submittedAt: string;
  submitterId?: string;
  answerCount: number;
}

export interface PublicOption {
  id: string;
  label: string;
}

export interface PublicQuestion {
  questionId: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  maxLength?: number;
  linearScaleConfig?: LinearScaleConfig;
  options?: PublicOption[];
}

export interface PublicSurvey {
  id: string;
  title: string;
  description?: string;
  questions: PublicQuestion[];
}

export interface OptionCount {
  optionId: string;
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  totalResponses: number;
  optionCounts?: OptionCount[];
  scaleDistribution?: Record<number, number>;
  scaleAverage?: number;
  scaleMedian?: number;
  textSamples?: string[];
}

export interface DailySubmissionCount {
  date: string;
  count: number;
}

export interface SurveyAnalytics {
  surveyId: string;
  surveyTitle: string;
  totalSubmissions: number;
  submissionsOverTime?: DailySubmissionCount[];
  questionAnalytics: QuestionAnalytics[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Array<{
    field: string;
    message: string;
    rejectedValue?: unknown;
  }>;
}
