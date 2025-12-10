import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  Slider,
  Typography,
} from '@mui/material';
import type { Question } from '../../types';

interface QuestionRendererProps {
  question: Question;
  value?: string | string[] | number;
  onChange?: (value: string | string[] | number) => void;
  disabled?: boolean;
  error?: string;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  disabled = false,
  error,
}: QuestionRendererProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.([e.target.value]);
  };

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    const currentValue = (value as string[]) || [];
    if (checked) {
      onChange?.([...currentValue, optionId]);
    } else {
      onChange?.(currentValue.filter((v) => v !== optionId));
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    onChange?.([selectedValue]);
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    onChange?.(newValue as number);
  };

  switch (question.type) {
    case 'SHORT_ANSWER':
      return (
        <TextField
          fullWidth
          label={question.title}
          helperText={error || question.description}
          error={!!error}
          value={(value as string) || ''}
          onChange={handleTextChange}
          disabled={disabled}
          required={question.required}
          inputProps={{ maxLength: question.maxLength }}
        />
      );

    case 'PARAGRAPH':
      return (
        <TextField
          fullWidth
          multiline
          rows={4}
          label={question.title}
          helperText={error || question.description}
          error={!!error}
          value={(value as string) || ''}
          onChange={handleTextChange}
          disabled={disabled}
          required={question.required}
          inputProps={{ maxLength: question.maxLength }}
        />
      );

    case 'MULTIPLE_CHOICE':
      return (
        <FormControl component="fieldset" error={!!error} disabled={disabled} fullWidth>
          <FormLabel component="legend" required={question.required}>
            {question.title}
          </FormLabel>
          {question.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              {question.description}
            </Typography>
          )}
          <RadioGroup
            value={(value as string[])?.[0] || ''}
            onChange={handleRadioChange}
          >
            {question.options?.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </FormControl>
      );

    case 'CHECKBOXES':
      return (
        <FormControl component="fieldset" error={!!error} disabled={disabled} fullWidth>
          <FormLabel component="legend" required={question.required}>
            {question.title}
          </FormLabel>
          {question.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              {question.description}
            </Typography>
          )}
          <FormGroup>
            {question.options?.map((option) => (
              <FormControlLabel
                key={option.id}
                control={
                  <Checkbox
                    checked={(value as string[])?.includes(option.id!) || false}
                    onChange={(e) => handleCheckboxChange(option.id!, e.target.checked)}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </FormControl>
      );

    case 'DROPDOWN':
      return (
        <FormControl fullWidth error={!!error} disabled={disabled}>
          <FormLabel required={question.required}>{question.title}</FormLabel>
          {question.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              {question.description}
            </Typography>
          )}
          <Select
            value={(value as string[])?.[0] || ''}
            onChange={(e) => handleSelectChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select an option
            </MenuItem>
            {question.options?.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </FormControl>
      );

    case 'DATE':
      return (
        <TextField
          fullWidth
          type="date"
          label={question.title}
          helperText={error || question.description}
          error={!!error}
          value={(value as string) || ''}
          onChange={handleTextChange}
          disabled={disabled}
          required={question.required}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );

    case 'TIME':
      return (
        <TextField
          fullWidth
          type="time"
          label={question.title}
          helperText={error || question.description}
          error={!!error}
          value={(value as string) || ''}
          onChange={handleTextChange}
          disabled={disabled}
          required={question.required}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );

    case 'LINEAR_SCALE': {
      const config = question.linearScaleConfig;
      const min = config?.minValue || 1;
      const max = config?.maxValue || 5;
      const step = config?.step || 1;

      const marks = [];
      for (let i = min; i <= max; i += step) {
        marks.push({ value: i, label: i.toString() });
      }

      return (
        <FormControl component="fieldset" error={!!error} disabled={disabled} fullWidth>
          <FormLabel component="legend" required={question.required}>
            {question.title}
          </FormLabel>
          {question.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              {question.description}
            </Typography>
          )}
          <Box sx={{ px: 2, mt: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption">{config?.leftLabel || min}</Typography>
              <Typography variant="caption">{config?.rightLabel || max}</Typography>
            </Box>
            <Slider
              value={(value as number) || min}
              onChange={handleSliderChange}
              min={min}
              max={max}
              step={step}
              marks={marks}
              valueLabelDisplay="auto"
            />
          </Box>
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </FormControl>
      );
    }

    default:
      return (
        <Typography color="error">
          Unknown question type: {question.type}
        </Typography>
      );
  }
}
