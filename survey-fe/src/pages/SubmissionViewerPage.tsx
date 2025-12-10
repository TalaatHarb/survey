import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { surveyApi } from '../services/api';
import type { QuestionResponseDetail } from '../types';

export default function SubmissionViewerPage() {
  const { t } = useTranslation();
  const { surveyId, submissionId } = useParams<{ surveyId: string; submissionId: string }>();
  const navigate = useNavigate();

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['submission', surveyId, submissionId],
    queryFn: () => surveyApi.getSubmission(surveyId!, submissionId!),
    enabled: !!surveyId && !!submissionId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !submission) {
    return <Alert severity="error">{t('app.error')}</Alert>;
  }

  const renderAnswer = (answer: QuestionResponseDetail) => {
    switch (answer.answerType) {
      case 'TEXT':
      case 'DATE':
      case 'TIME':
        return (
          <Typography>
            {answer.textAnswer || <em style={{ color: '#999' }}>No answer</em>}
          </Typography>
        );

      case 'SELECTION':
        if (!answer.selectedOptions?.length) {
          return <Typography color="text.secondary"><em>No selection</em></Typography>;
        }
        return (
          <Box display="flex" gap={1} flexWrap="wrap">
            {answer.selectedOptions.map((option) => (
              <Chip key={option.optionId} label={option.label} size="small" />
            ))}
          </Box>
        );

      case 'NUMERIC':
        return (
          <Typography>
            {answer.numericAnswer ?? <em style={{ color: '#999' }}>No answer</em>}
          </Typography>
        );

      default:
        return <Typography color="text.secondary">Unknown answer type</Typography>;
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/editor/${surveyId}`)}
        sx={{ mb: 2 }}
      >
        {t('action.back')}
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Submission Details
        </Typography>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Submission ID
            </Typography>
            <Typography sx={{ fontFamily: 'monospace' }}>
              {submission.id}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('results.submittedAt')}
            </Typography>
            <Typography>
              {new Date(submission.submittedAt).toLocaleString()}
            </Typography>
          </Box>
          {submission.submitterId && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Submitter
              </Typography>
              <Typography>{submission.submitterId}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Answers
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {submission.answers?.map((answer, index) => (
            <ListItem
              key={answer.id}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderBottom: index < (submission.answers?.length || 0) - 1 ? 1 : 0,
                borderColor: 'divider',
                py: 2,
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2">
                      {answer.questionTitle || `Question ${index + 1}`}
                    </Typography>
                    <Chip
                      label={answer.answerType}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {renderAnswer(answer)}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {(!submission.answers || submission.answers.length === 0) && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No answers in this submission
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
