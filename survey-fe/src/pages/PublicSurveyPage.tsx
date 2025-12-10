import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { publicApi } from '../services/api';
import type { PublicQuestion, QuestionResponse } from '../types';
import QuestionRenderer from '../components/questions/QuestionRenderer';

export default function PublicSurveyPage() {
  const { t } = useTranslation();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['publicSurvey', surveyId],
    queryFn: () => publicApi.getSurvey(surveyId!),
    enabled: !!surveyId,
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const questionResponses: QuestionResponse[] = Object.entries(answers).map(([questionId, value]) => {
        const response: QuestionResponse = { questionId };
        
        if (typeof value === 'string') {
          response.textAnswer = value;
        } else if (Array.isArray(value)) {
          response.selectedOptionIds = value;
        } else if (typeof value === 'number') {
          response.numericAnswer = value;
        }
        
        return response;
      });

      return publicApi.submitResponse(surveyId!, {
        surveyId: surveyId!,
        answers: questionResponses,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: Error) => {
      setSnackbar({
        open: true,
        message: error.message || t('message.error'),
        severity: 'error',
      });
    },
  });

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear error when user provides answer
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    survey?.questions.forEach((question: PublicQuestion) => {
      if (question.required) {
        const answer = answers[question.questionId];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.questionId] = t('validation.required');
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      submitMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !survey) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{t('public.notAvailable')}</Alert>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.100"
        px={2}
      >
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', maxWidth: 500, width: '100%', mx: 2 }}>
          <Typography variant="h4" gutterBottom color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {t('public.submitted')}
          </Typography>
          <Typography color="text.secondary">
            {t('public.submittedMessage')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Container maxWidth="md" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Survey header */}
        <Paper sx={{ p: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 3 }, borderTop: 4, borderColor: 'primary.main' }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {survey.title}
          </Typography>
          {survey.description && (
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {survey.description}
            </Typography>
          )}
        </Paper>

        {/* Questions */}
        {survey.questions.map((question: PublicQuestion) => (
          <Paper key={question.questionId} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 1.5, sm: 2 } }}>
            <QuestionRenderer
              question={{
                id: question.questionId,
                title: question.title,
                description: question.description,
                type: question.type,
                required: question.required,
                maxLength: question.maxLength,
                linearScaleConfig: question.linearScaleConfig,
                options: question.options?.map((o) => ({ id: o.id, label: o.label })),
              }}
              value={answers[question.questionId]}
              onChange={(value) => handleAnswerChange(question.questionId, value)}
              error={errors[question.questionId]}
            />
          </Paper>
        ))}

        {/* Submit button */}
        <Box display="flex" justifyContent="center" mt={{ xs: 2, sm: 3 }} mb={{ xs: 2, sm: 0 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            fullWidth
            sx={{ maxWidth: { xs: '100%', sm: 300 } }}
          >
            {submitMutation.isPending ? t('preview.submitting') : t('public.submit')}
          </Button>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
