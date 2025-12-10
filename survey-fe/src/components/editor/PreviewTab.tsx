import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { publicApi } from '../../services/api';
import type { PublicQuestion } from '../../types';
import QuestionRenderer from '../questions/QuestionRenderer';

interface PreviewTabProps {
  readonly surveyId: string;
}

export default function PreviewTab({ surveyId }: PreviewTabProps) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['publicSurvey', surveyId],
    queryFn: () => publicApi.getSurvey(surveyId),
  });

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    // Just simulate submission in preview
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="warning">
          Survey must be published to preview. Publish the survey first.
        </Alert>
      </Box>
    );
  }

  if (!survey) {
    return null;
  }

  if (submitted) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h5" gutterBottom color="success.main">
            {t('public.submitted')}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {t('public.submittedMessage')}
          </Typography>
          <Button variant="outlined" onClick={handleReset}>
            Preview Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', overflow: 'auto', height: '100%' }}>
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {survey.title}
        </Typography>
        {survey.description && (
          <Typography color="text.secondary">
            {survey.description}
          </Typography>
        )}
      </Paper>

      {survey.questions.map((question: PublicQuestion) => (
        <Paper key={question.questionId} sx={{ p: 3, mb: 2 }}>
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
          />
        </Paper>
      ))}

      <Box display="flex" justifyContent="center" mt={3}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          {t('preview.submit')}
        </Button>
      </Box>
    </Box>
  );
}
