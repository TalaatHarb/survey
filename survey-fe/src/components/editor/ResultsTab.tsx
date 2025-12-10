import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { surveyApi } from '../../services/api';
import type { QuestionAnalytics } from '../../types';

interface ResultsTabProps {
  surveyId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ResultsTab({ surveyId }: ResultsTabProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', surveyId],
    queryFn: () => surveyApi.getAnalytics(surveyId),
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', surveyId],
    queryFn: () => surveyApi.getSubmissions(surveyId, 0, 100),
    enabled: tabIndex === 1,
  });

  if (analyticsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box p={4}>
        <Alert severity="info">{t('results.noResponses')}</Alert>
      </Box>
    );
  }

  const renderQuestionChart = (question: QuestionAnalytics) => {
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
      case 'DROPDOWN': {
        if (!question.optionCounts?.length) return null;
        const pieData = question.optionCounts.map(opt => ({
          name: opt.label,
          value: opt.count,
          percentage: opt.percentage,
        }));
        return (
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={(entry) => `${entry.name} (${((entry.percent ?? 0) * 100).toFixed(1)}%)`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[pieData.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );
      }

      case 'CHECKBOXES':
        if (!question.optionCounts?.length) return null;
        return (
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={question.optionCounts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );

      case 'LINEAR_SCALE': {
        if (!question.scaleDistribution) return null;
        const scaleData = Object.entries(question.scaleDistribution).map(([value, count]) => ({
          value: Number(value),
          count,
        }));
        return (
          <Box>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={scaleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box display="flex" gap={4} mt={1}>
              <Typography variant="body2">
                Average: <strong>{question.scaleAverage?.toFixed(2) || 'N/A'}</strong>
              </Typography>
              <Typography variant="body2">
                Median: <strong>{question.scaleMedian || 'N/A'}</strong>
              </Typography>
            </Box>
          </Box>
        );
      }

      case 'SHORT_ANSWER':
      case 'PARAGRAPH':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sample responses:
            </Typography>
            {question.textSamples?.slice(0, 5).map((text) => (
              <Paper key={text.substring(0, 50)} variant="outlined" sx={{ p: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  "{text}"
                </Typography>
              </Paper>
            ))}
            {!question.textSamples?.length && (
              <Typography variant="body2" color="text.secondary">
                No text responses yet
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            {question.totalResponses} responses
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        <Tab label="Analytics" />
        <Tab label="Submissions" />
      </Tabs>

      {/* Analytics Tab */}
      {tabIndex === 0 && (
        <Box sx={{ p: 3 }}>
          {/* Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {analytics.totalSubmissions}
                </Typography>
                <Typography color="text.secondary">
                  {t('results.totalResponses')}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Submissions Over Time
                </Typography>
                {analytics.submissionsOverTime?.length ? (
                  <Box sx={{ height: 150 }}>
                    <ResponsiveContainer>
                      <LineChart data={analytics.submissionsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    Not enough data yet
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Per-question analytics */}
          {analytics.questionAnalytics.map((question) => (
            <Paper key={question.questionId} sx={{ p: 3, mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="subtitle1">{question.questionTitle}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {question.questionType} • {question.totalResponses} responses
                  </Typography>
                </Box>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(question.totalResponses / analytics.totalSubmissions) * 100}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {((question.totalResponses / analytics.totalSubmissions) * 100).toFixed(0)}% response rate
                  </Typography>
                </Box>
              </Box>
              {renderQuestionChart(question)}
            </Paper>
          ))}
        </Box>
      )}

      {/* Submissions Tab */}
      {tabIndex === 1 && (
        <Box sx={{ p: 3 }}>
          {submissionsLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>{t('results.submittedAt')}</TableCell>
                    <TableCell>Submitter</TableCell>
                    <TableCell>Answers</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions?.content.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {submission.id.slice(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{submission.submitterId || '-'}</TableCell>
                      <TableCell>{submission.answerCount}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/surveys/${surveyId}/submissions/${submission.id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}
