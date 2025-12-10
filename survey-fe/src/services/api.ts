import axios from 'axios';
import type { 
  Survey, 
  Question, 
  SurveyQuestionLink, 
  CreateSurveyQuestionLink,
  UpdateSurveyQuestionLink,
  PublicSurvey,
  SubmitSurveyResponse,
  SurveyResponse,
  SurveyResponseSummary,
  SurveyAnalytics,
  Page 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/survey';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Surveys (Admin) ====================

export const surveyApi = {
  getAll: async (page = 0, size = 20, search?: string): Promise<Page<Survey>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.append('search', search);
    const response = await api.get<Page<Survey>>(`/v1/admin/surveys?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Survey> => {
    const response = await api.get<Survey>(`/v1/admin/surveys/${id}`);
    return response.data;
  },

  create: async (survey: Partial<Survey>): Promise<Survey> => {
    const response = await api.post<Survey>('/v1/admin/surveys', survey);
    return response.data;
  },

  update: async (id: string, survey: Partial<Survey>): Promise<Survey> => {
    const response = await api.put<Survey>(`/v1/admin/surveys/${id}`, survey);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/admin/surveys/${id}`);
  },

  // Question links
  getLinks: async (surveyId: string): Promise<SurveyQuestionLink[]> => {
    const response = await api.get<SurveyQuestionLink[]>(`/v1/admin/surveys/${surveyId}/links`);
    return response.data;
  },

  addLink: async (surveyId: string, link: CreateSurveyQuestionLink): Promise<SurveyQuestionLink> => {
    const response = await api.post<SurveyQuestionLink>(`/v1/admin/surveys/${surveyId}/links`, link);
    return response.data;
  },

  updateLink: async (surveyId: string, linkId: string, update: UpdateSurveyQuestionLink): Promise<SurveyQuestionLink> => {
    const response = await api.patch<SurveyQuestionLink>(`/v1/admin/surveys/${surveyId}/links/${linkId}`, update);
    return response.data;
  },

  removeLink: async (surveyId: string, linkId: string): Promise<void> => {
    await api.delete(`/v1/admin/surveys/${surveyId}/links/${linkId}`);
  },

  // Analytics
  getAnalytics: async (surveyId: string): Promise<SurveyAnalytics> => {
    const response = await api.get<SurveyAnalytics>(`/v1/admin/surveys/${surveyId}/results`);
    return response.data;
  },

  getSubmissions: async (surveyId: string, page = 0, size = 20): Promise<Page<SurveyResponseSummary>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const response = await api.get<Page<SurveyResponseSummary>>(`/v1/admin/surveys/${surveyId}/results/submissions?${params}`);
    return response.data;
  },

  getSubmission: async (surveyId: string, submissionId: string): Promise<SurveyResponse> => {
    const response = await api.get<SurveyResponse>(`/v1/admin/surveys/${surveyId}/results/submissions/${submissionId}`);
    return response.data;
  },
};

// ==================== Questions (Admin) ====================

export const questionApi = {
  getAll: async (page = 0, size = 20, search?: string): Promise<Page<Question>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.append('search', search);
    const response = await api.get<Page<Question>>(`/v1/admin/questions?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Question> => {
    const response = await api.get<Question>(`/v1/admin/questions/${id}`);
    return response.data;
  },

  create: async (question: Partial<Question>): Promise<Question> => {
    const response = await api.post<Question>('/v1/admin/questions', question);
    return response.data;
  },

  update: async (id: string, question: Partial<Question>): Promise<Question> => {
    const response = await api.put<Question>(`/v1/admin/questions/${id}`, question);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/admin/questions/${id}`);
  },

  copy: async (id: string): Promise<Question> => {
    const response = await api.post<Question>(`/v1/admin/questions/${id}/copy`);
    return response.data;
  },
};

// ==================== Public API ====================

export const publicApi = {
  getSurvey: async (surveyId: string): Promise<PublicSurvey> => {
    const response = await api.get<PublicSurvey>(`/v1/public/surveys/${surveyId}`);
    return response.data;
  },

  submitResponse: async (surveyId: string, submission: SubmitSurveyResponse): Promise<SurveyResponse> => {
    const response = await api.post<SurveyResponse>(`/v1/public/surveys/${surveyId}/responses`, submission);
    return response.data;
  },

  getResponse: async (surveyId: string, responseId: string): Promise<SurveyResponse> => {
    const response = await api.get<SurveyResponse>(`/v1/public/surveys/${surveyId}/responses/${responseId}`);
    return response.data;
  },
};

export default api;
