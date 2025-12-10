import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { questionApi, surveyApi } from '../../services/api';
import type { Question, QuestionType } from '../../types';

interface QuestionBankPanelProps {
  readonly surveyId: string;
  readonly onQuestionAdded: () => void;
}

const questionTypeColors: Record<QuestionType, string> = {
  SHORT_ANSWER: '#2196f3',
  PARAGRAPH: '#4caf50',
  MULTIPLE_CHOICE: '#ff9800',
  CHECKBOXES: '#9c27b0',
  DROPDOWN: '#00bcd4',
  DATE: '#f44336',
  TIME: '#795548',
  LINEAR_SCALE: '#607d8b',
};

export default function QuestionBankPanel({ surveyId, onQuestionAdded }: QuestionBankPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['questions', search],
    queryFn: () => questionApi.getAll(0, 100, search || undefined),
  });

  const addLinkMutation = useMutation({
    mutationFn: (questionId: string) => surveyApi.addLink(surveyId, { questionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      onQuestionAdded();
    },
  });

  const copyMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const copied = await questionApi.copy(questionId);
      await surveyApi.addLink(surveyId, { questionId: copied.id! });
      return copied;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      onQuestionAdded();
    },
  });

  const questions = data?.content || [];

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        {t('questionBank.title')}
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder={t('questionBank.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : questions.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 2 }}>
            {t('questionBank.empty')}
          </Typography>
        ) : (
          <List dense>
            {questions.map((question: Question) => (
              <ListItem
                key={question.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {question.title}
                      </Typography>
                      <Chip
                        label={t(`questionType.${question.type}`)}
                        size="small"
                        sx={{
                          bgcolor: questionTypeColors[question.type],
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title={t('questionBank.add')}>
                    <IconButton
                      size="small"
                      onClick={() => addLinkMutation.mutate(question.id!)}
                      disabled={addLinkMutation.isPending}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('questionBank.copy')}>
                    <IconButton
                      size="small"
                      onClick={() => copyMutation.mutate(question.id!)}
                      disabled={copyMutation.isPending}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
