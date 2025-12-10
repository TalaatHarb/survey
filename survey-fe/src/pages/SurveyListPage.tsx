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
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { surveyApi } from '../services/api';
import type { Survey } from '../types';

export default function SurveyListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<Survey | null>(null);
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

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

  const importMutation = useMutation({
    mutationFn: (file: File) => surveyApi.importSurvey(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setImportDialog(false);
      setImportFile(null);
    },
  });

  const handleDelete = () => {
    if (deleteDialog?.id) {
      deleteMutation.mutate(deleteDialog.id);
    }
  };

  const handleExport = async (surveyId: string, title: string) => {
    const surveyData = await surveyApi.exportSurvey(surveyId);
    const blob = new Blob([JSON.stringify(surveyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importFile) {
      importMutation.mutate(importFile);
    }
  };

  const copyPublicLink = (surveyId: string) => {
    const url = `${globalThis.location.origin}/public/${surveyId}`;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4">{t('surveys.title')}</Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialog(true)}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/editor"
          >
            {t('surveys.create')}
          </Button>
        </Box>
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {surveys.map((survey) => (
            <Card key={survey.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                
                <CardActions sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/editor/${survey.id}`)}
                  >
                    {t('action.edit')}
                  </Button>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleExport(survey.id!, survey.title)}
                    title="Export survey"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  
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
          ))}
        </Box>
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

      {/* Import dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Survey</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload a survey JSON file to import. The survey and its questions will be created or updated.
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              {importFile ? importFile.name : 'Choose File'}
              <input
                type="file"
                hidden
                accept="application/json,.json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setImportDialog(false); setImportFile(null); }}>
            {t('action.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!importFile || importMutation.isPending}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
