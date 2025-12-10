import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import { surveyApi } from '../services/api';
import type { Survey } from '../types';

export default function SurveyListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<Survey | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['surveys', search],
    queryFn: () => surveyApi.getAll(0, 50, search || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => surveyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setDeleteDialog(null);
    },
  });

  const handleDelete = () => {
    if (deleteDialog?.id) {
      deleteMutation.mutate(deleteDialog.id);
    }
  };

  const copyPublicLink = (surveyId: string) => {
    const url = `${window.location.origin}/public/${surveyId}`;
    navigator.clipboard.writeText(url);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{t('app.error')}</Alert>;
  }

  const surveys = data?.content || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('surveys.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/editor"
        >
          {t('surveys.create')}
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder={t('surveys.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {surveys.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">{t('surveys.empty')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/editor"
            sx={{ mt: 2 }}
          >
            {t('surveys.create')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {surveys.map((survey) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={survey.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                      {survey.title}
                    </Typography>
                    <Chip
                      label={survey.published ? t('surveys.published') : t('surveys.draft')}
                      color={survey.published ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  {survey.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {survey.description}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    {t('surveys.questions', { count: survey.questionCount || 0 })}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/editor/${survey.id}`)}
                  >
                    {t('action.edit')}
                  </Button>
                  
                  {survey.published && (
                    <IconButton
                      size="small"
                      onClick={() => copyPublicLink(survey.id!)}
                      title="Copy public link"
                    >
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  )}
                  
                  <Box flex={1} />
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteDialog(survey)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>{t('action.delete')}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>{t('action.cancel')}</Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {t('action.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
