import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ShortTextIcon from '@mui/icons-material/ShortText';
import SubjectIcon from '@mui/icons-material/Subject';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { questionApi, surveyApi } from '../../services/api';
import type { Question, QuestionType, QuestionOption } from '../../types';

interface ToolboxProps {
  surveyId: string;
  onQuestionAdded: () => void;
}

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
  SHORT_ANSWER: <ShortTextIcon />,
  PARAGRAPH: <SubjectIcon />,
  MULTIPLE_CHOICE: <RadioButtonCheckedIcon />,
  CHECKBOXES: <CheckBoxIcon />,
  DROPDOWN: <ArrowDropDownCircleIcon />,
  DATE: <EventIcon />,
  TIME: <AccessTimeIcon />,
  LINEAR_SCALE: <LinearScaleIcon />,
};

const requiresOptions = (type: QuestionType): boolean =>
  ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(type);

export default function Toolbox({ surveyId, onQuestionAdded }: ToolboxProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [creating, setCreating] = useState<QuestionType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>(['Option 1']);
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(5);

  const createMutation = useMutation({
    mutationFn: async (type: QuestionType) => {
      const questionOptions: QuestionOption[] = requiresOptions(type)
        ? options.filter(o => o.trim()).map((label, i) => ({ label, orderIndex: i }))
        : [];

      const question: Partial<Question> = {
        title: title.trim() || `New ${t(`questionType.${type}`)} Question`,
        description: description.trim() || undefined,
        type,
        required,
        options: questionOptions.length > 0 ? questionOptions : undefined,
        linearScaleConfig: type === 'LINEAR_SCALE' ? {
          minValue: scaleMin,
          maxValue: scaleMax,
          step: 1,
        } : undefined,
      };

      const created = await questionApi.create(question);
      await surveyApi.addLink(surveyId, { questionId: created.id! });
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      onQuestionAdded();
      resetForm();
    },
  });

  const resetForm = () => {
    setCreating(null);
    setTitle('');
    setDescription('');
    setRequired(false);
    setOptions(['Option 1']);
    setScaleMin(1);
    setScaleMax(5);
  };

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const questionTypes: QuestionType[] = [
    'SHORT_ANSWER',
    'PARAGRAPH',
    'MULTIPLE_CHOICE',
    'CHECKBOXES',
    'DROPDOWN',
    'DATE',
    'TIME',
    'LINEAR_SCALE',
  ];

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        {t('toolbox.title')}
      </Typography>

      {!creating ? (
        <List dense>
          {questionTypes.map((type) => (
            <ListItem
              key={type}
              component={Button}
              onClick={() => setCreating(type)}
              sx={{
                mb: 0.5,
                borderRadius: 1,
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {questionTypeIcons[type]}
              </ListItemIcon>
              <ListItemText primary={t(`questionType.${type}`)} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            New {t(`questionType.${creating}`)}
          </Typography>

          <TextField
            fullWidth
            label={t('question.title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('question.titlePlaceholder')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={t('question.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
            }
            label={t('question.required')}
            sx={{ mb: 2 }}
          />

          {/* Options for choice questions */}
          {requiresOptions(creating) && (
            <Box sx={{ mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                {t('question.options')}
              </Typography>
              {options.map((option, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={t('question.optionPlaceholder', { number: index + 1 })}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={addOption}
              >
                {t('question.addOption')}
              </Button>
            </Box>
          )}

          {/* Linear scale config */}
          {creating === 'LINEAR_SCALE' && (
            <Box sx={{ mb: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Scale Configuration
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  type="number"
                  size="small"
                  label={t('question.scaleMin')}
                  value={scaleMin}
                  onChange={(e) => setScaleMin(Number(e.target.value))}
                  sx={{ width: 100 }}
                />
                <TextField
                  type="number"
                  size="small"
                  label={t('question.scaleMax')}
                  value={scaleMax}
                  onChange={(e) => setScaleMax(Number(e.target.value))}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={() => createMutation.mutate(creating)}
              disabled={createMutation.isPending}
            >
              {t('question.save')}
            </Button>
            <Button onClick={resetForm}>
              {t('question.cancel')}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
