import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  Collapse,
  Menu,
  MenuItem,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { surveyApi } from '../../services/api';
import type { SurveyQuestionLink, QuestionType } from '../../types';
import QuestionRenderer from '../questions/QuestionRenderer';

interface SurveyCanvasProps {
  surveyId: string;
  questionLinks: SurveyQuestionLink[];
  onUpdate: () => void;
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

export default function SurveyCanvas({ surveyId, questionLinks, onUpdate }: SurveyCanvasProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; linkId: string } | null>(null);
  const [editingOverrides, setEditingOverrides] = useState<Record<string, { label: string; required: boolean }>>({});

  const updateLinkMutation = useMutation({
    mutationFn: ({ linkId, data }: { linkId: string; data: Record<string, unknown> }) =>
      surveyApi.updateLink(surveyId, linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      onUpdate();
    },
  });

  const removeLinkMutation = useMutation({
    mutationFn: (linkId: string) => surveyApi.removeLink(surveyId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      onUpdate();
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const link = questionLinks[sourceIndex];
    if (link.id) {
      updateLinkMutation.mutate({
        linkId: link.id,
        data: { orderIndex: destIndex },
      });
    }
  };

  const toggleExpand = (linkId: string) => {
    setExpandedId(expandedId === linkId ? null : linkId);
  };

  const handleOverrideChange = (linkId: string, field: 'label' | 'required', value: string | boolean) => {
    setEditingOverrides((prev) => ({
      ...prev,
      [linkId]: {
        ...prev[linkId],
        [field]: value,
      },
    }));
  };

  const saveOverrides = (linkId: string, link: SurveyQuestionLink) => {
    const overrides = editingOverrides[linkId];
    if (!overrides) return;

    updateLinkMutation.mutate({
      linkId,
      data: {
        labelOverride: overrides.label !== link.question?.title ? overrides.label : null,
        requiredOverride: overrides.required !== link.question?.required ? overrides.required : null,
      },
    });
  };

  const toggleHidden = (link: SurveyQuestionLink) => {
    if (link.id) {
      updateLinkMutation.mutate({
        linkId: link.id,
        data: { hidden: !link.hidden },
      });
    }
  };

  if (questionLinks.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        p={4}
      >
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('editor.noQuestions')}
          </Typography>
          <Typography color="text.secondary">
            {t('editor.addQuestion')}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="survey-questions">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {questionLinks.map((link, index) => (
                <Draggable
                  key={link.id}
                  draggableId={link.id || `temp-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        mb: 2,
                        opacity: link.hidden ? 0.5 : 1,
                        boxShadow: snapshot.isDragging ? 4 : 1,
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      {/* Question header */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderBottom: expandedId === link.id ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: 'grab' }}>
                          <DragIndicatorIcon color="action" />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {link.effectiveLabel || link.question?.title}
                            </Typography>
                            {link.effectivelyRequired && (
                              <Typography color="error">*</Typography>
                            )}
                            {link.hidden && (
                              <VisibilityOffIcon fontSize="small" color="action" />
                            )}
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Chip
                              label={t(`questionType.${link.questionType || link.question?.type}`)}
                              size="small"
                              sx={{
                                bgcolor: questionTypeColors[link.questionType || link.question?.type || 'SHORT_ANSWER'],
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                            {link.labelOverride && (
                              <Chip label="Custom label" size="small" variant="outlined" sx={{ height: 20 }} />
                            )}
                          </Box>
                        </Box>

                        <IconButton size="small" onClick={() => toggleExpand(link.id!)}>
                          {expandedId === link.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ el: e.currentTarget, linkId: link.id! })}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {/* Expanded content */}
                      <Collapse in={expandedId === link.id}>
                        <Box sx={{ p: 2 }}>
                          {/* Override controls */}
                          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                              Overrides for this survey:
                            </Typography>
                            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                              <TextField
                                size="small"
                                label="Label override"
                                value={editingOverrides[link.id!]?.label ?? link.effectiveLabel ?? ''}
                                onChange={(e) => handleOverrideChange(link.id!, 'label', e.target.value)}
                                onBlur={() => saveOverrides(link.id!, link)}
                                sx={{ flex: 1, minWidth: 200 }}
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    size="small"
                                    checked={editingOverrides[link.id!]?.required ?? link.effectivelyRequired ?? false}
                                    onChange={(e) => {
                                      handleOverrideChange(link.id!, 'required', e.target.checked);
                                      updateLinkMutation.mutate({
                                        linkId: link.id!,
                                        data: { requiredOverride: e.target.checked },
                                      });
                                    }}
                                  />
                                }
                                label={t('question.required')}
                              />
                            </Box>
                          </Box>

                          {/* Question preview */}
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Preview:
                          </Typography>
                          <QuestionRenderer question={link.question!} disabled />
                        </Box>
                      </Collapse>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            const link = questionLinks.find((l) => l.id === menuAnchor?.linkId);
            if (link) toggleHidden(link);
            setMenuAnchor(null);
          }}
        >
          <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
          {questionLinks.find((l) => l.id === menuAnchor?.linkId)?.hidden ? 'Show' : 'Hide'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor?.linkId) removeLinkMutation.mutate(menuAnchor.linkId);
            setMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Remove
        </MenuItem>
      </Menu>
    </Box>
  );
}
