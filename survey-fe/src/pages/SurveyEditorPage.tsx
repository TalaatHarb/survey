import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { surveyApi } from '../services/api';
import type { Survey, SurveyQuestionLink } from '../types';
import QuestionBankPanel from '../components/editor/QuestionBankPanel';
import SurveyCanvas from '../components/editor/SurveyCanvas';
import Toolbox from '../components/editor/Toolbox';
import PreviewTab from '../components/editor/PreviewTab';
import ResultsTab from '../components/editor/ResultsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ height: '100%' }}>
      {value === index && children}
    </div>
  );
}

export default function SurveyEditorPage() {
  const { t } = useTranslation();
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabIndex, setTabIndex] = useState(0);
  const [mobilePanel, setMobilePanel] = useState(0); // 0: Canvas, 1: Question Bank, 2: Toolbox
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isNew = !surveyId;

  // Fetch survey data
  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => surveyApi.getById(surveyId!),
    enabled: !!surveyId,
  });

  // Update local state when survey data is loaded
  useEffect(() => {
    if (survey) {
      setTitle(survey.title);
      setDescription(survey.description || '');
      setPublished(survey.published);
    }
  }, [survey]);

  // Create survey mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Survey>) => surveyApi.create(data),
    onSuccess: (newSurvey) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setSnackbar({ open: true, message: t('message.saved'), severity: 'success' });
      navigate(`/editor/${newSurvey.id}`, { replace: true });
    },
    onError: () => {
      setSnackbar({ open: true, message: t('message.error'), severity: 'error' });
    },
  });

  // Update survey mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Survey>) => surveyApi.update(surveyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setSnackbar({ open: true, message: t('message.saved'), severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: t('message.error'), severity: 'error' });
    },
  });

  const handleSave = useCallback(() => {
    const data: Partial<Survey> = {
      title: title.trim() || 'Untitled Survey',
      description: description.trim() || undefined,
      published,
    };

    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  }, [title, description, published, isNew, createMutation, updateMutation]);

  const handleQuestionAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
  }, [queryClient, surveyId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !isNew) {
    return <Alert severity="error">{t('app.error')}</Alert>;
  }

  const questionLinks: SurveyQuestionLink[] = survey?.questionLinks || [];

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label={t('editor.surveyTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Survey"
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label={t('editor.surveyDescription')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              maxRows={2}
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box display="flex" alignItems="center" justifyContent={{ xs: 'space-between', md: 'flex-start' }} gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    disabled={isNew || questionLinks.length === 0}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label={published ? t('editor.publish') : t('editor.unpublish')}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                size={isMobile ? 'small' : 'medium'}
              >
                {t('editor.save')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label={t('editor.tabs.edit')} />
          <Tab label={t('editor.tabs.preview')} disabled={isNew} />
          <Tab label={t('editor.tabs.results')} disabled={isNew} />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {/* Edit Tab */}
          <TabPanel value={tabIndex} index={0}>
            {isNew ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('editor.noQuestions')}
                  </Typography>
                  <Typography color="text.secondary" mb={2}>
                    Save the survey first to start adding questions
                  </Typography>
                  <Button variant="contained" onClick={handleSave}>
                    {t('editor.save')} Survey
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Mobile panel tabs */}
                {isMobile && (
                  <Tabs
                    value={mobilePanel}
                    onChange={(_, v) => setMobilePanel(v)}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
                  >
                    <Tab label={t('editor.canvas')} sx={{ minHeight: 40, py: 1 }} />
                    <Tab label={t('editor.questionBank')} sx={{ minHeight: 40, py: 1 }} />
                    <Tab label={t('editor.toolbox')} sx={{ minHeight: 40, py: 1 }} />
                  </Tabs>
                )}
                
                {/* Desktop: Three-column layout */}
                {!isMobile ? (
                  <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
                    {/* Left panel - Question Bank */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ borderRight: 1, borderColor: 'divider', height: '100%', overflow: 'auto' }}>
                      <QuestionBankPanel surveyId={surveyId!} onQuestionAdded={handleQuestionAdded} />
                    </Grid>

                    {/* Middle panel - Survey Canvas */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%', overflow: 'auto', bgcolor: 'grey.50' }}>
                      <SurveyCanvas
                        surveyId={surveyId!}
                        questionLinks={questionLinks}
                        onUpdate={handleQuestionAdded}
                      />
                    </Grid>

                    {/* Right panel - Toolbox */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ borderLeft: 1, borderColor: 'divider', height: '100%', overflow: 'auto' }}>
                      <Toolbox surveyId={surveyId!} onQuestionAdded={handleQuestionAdded} />
                    </Grid>
                  </Grid>
                ) : (
                  /* Mobile: Tab-based panels */
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {mobilePanel === 0 && (
                      <SurveyCanvas
                        surveyId={surveyId!}
                        questionLinks={questionLinks}
                        onUpdate={handleQuestionAdded}
                      />
                    )}
                    {mobilePanel === 1 && (
                      <QuestionBankPanel surveyId={surveyId!} onQuestionAdded={handleQuestionAdded} />
                    )}
                    {mobilePanel === 2 && (
                      <Toolbox surveyId={surveyId!} onQuestionAdded={handleQuestionAdded} />
                    )}
                  </Box>
                )}
              </Box>
            )}
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel value={tabIndex} index={1}>
            {surveyId && <PreviewTab surveyId={surveyId} />}
          </TabPanel>

          {/* Results Tab */}
          <TabPanel value={tabIndex} index={2}>
            {surveyId && <ResultsTab surveyId={surveyId} />}
          </TabPanel>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
