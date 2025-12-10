package net.talaatharb.survey.service;

import lombok.RequiredArgsConstructor;
import net.talaatharb.survey.dto.*;
import net.talaatharb.survey.entity.QuestionEntity;
import net.talaatharb.survey.entity.SurveyEntity;
import net.talaatharb.survey.entity.SurveyQuestionLinkEntity;
import net.talaatharb.survey.exception.ResourceNotFoundException;
import net.talaatharb.survey.exception.ValidationException;
import net.talaatharb.survey.mapper.QuestionMapper;
import net.talaatharb.survey.mapper.SurveyMapper;
import net.talaatharb.survey.repository.SurveyQuestionLinkRepository;
import net.talaatharb.survey.repository.SurveyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing surveys.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionLinkRepository linkRepository;
    private final QuestionService questionService;
    private final SurveyMapper surveyMapper;
    private final QuestionMapper questionMapper;

    /**
     * Get all surveys with pagination.
     */
    @Transactional(readOnly = true)
    public Page<SurveyDto> getAllSurveys(Pageable pageable) {
        return surveyRepository.findByArchivedFalse(pageable)
                .map(surveyMapper::toDto);
    }

    /**
     * Search surveys by title.
     */
    @Transactional(readOnly = true)
    public Page<SurveyDto> searchSurveys(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return getAllSurveys(pageable);
        }
        return surveyRepository.searchByTitle(search, pageable)
                .map(surveyMapper::toDto);
    }

    /**
     * Get a survey by ID with full details.
     */
    @Transactional(readOnly = true)
    public SurveyDto getSurveyById(UUID id) {
        SurveyEntity entity = surveyRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", id));

        SurveyDto dto = surveyMapper.toDto(entity);

        // Populate question links with full details
        List<SurveyQuestionLinkDto> linkDtos = entity.getQuestionLinks().stream()
                .map(link -> {
                    SurveyQuestionLinkDto linkDto = surveyMapper.toLinkDto(link);
                    linkDto.setQuestion(questionMapper.toDto(link.getQuestion()));
                    return linkDto;
                })
                .toList();
        dto.setQuestionLinks(linkDtos);

        return dto;
    }

    /**
     * Get survey entity by ID (internal use).
     */
    @Transactional(readOnly = true)
    public SurveyEntity getSurveyEntityById(UUID id) {
        return surveyRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", id));
    }

    /**
     * Create a new survey.
     */
    public SurveyDto createSurvey(SurveyDto dto) {
        SurveyEntity entity = surveyMapper.toEntity(dto);
        entity.setId(null);
        entity.setPublished(false); // New surveys start unpublished
        
        SurveyEntity saved = surveyRepository.save(entity);
        return surveyMapper.toDto(saved);
    }

    /**
     * Update a survey.
     */
    public SurveyDto updateSurvey(UUID id, SurveyDto dto) {
        SurveyEntity entity = surveyRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", id));

        surveyMapper.updateEntity(dto, entity);

        // Validate before publishing
        if (Boolean.TRUE.equals(dto.getPublished()) && !entity.isPublished()) {
            validateSurveyForPublishing(entity);
        }

        SurveyEntity saved = surveyRepository.save(entity);
        return surveyMapper.toDto(saved);
    }

    /**
     * Delete (archive) a survey.
     */
    public void deleteSurvey(UUID id) {
        SurveyEntity entity = surveyRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", id));
        entity.setArchived(true);
        surveyRepository.save(entity);
    }

    /**
     * Add a question to a survey.
     */
    public SurveyQuestionLinkDto addQuestionToSurvey(UUID surveyId, CreateSurveyQuestionLinkDto dto) {
        SurveyEntity survey = surveyRepository.findByIdAndArchivedFalse(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));

        QuestionEntity question = questionService.getQuestionEntityById(dto.getQuestionId());

        // Check if already linked
        if (linkRepository.findBySurveyIdAndQuestionId(surveyId, dto.getQuestionId()).isPresent()) {
            throw new ValidationException("Question is already added to this survey");
        }

        // Determine order index
        int orderIndex = dto.getOrderIndex() != null 
                ? dto.getOrderIndex() 
                : linkRepository.getMaxOrderIndex(surveyId) + 1;

        SurveyQuestionLinkEntity link = SurveyQuestionLinkEntity.builder()
                .survey(survey)
                .question(question)
                .orderIndex(orderIndex)
                .requiredOverride(dto.getRequiredOverride())
                .labelOverride(dto.getLabelOverride())
                .descriptionOverride(dto.getDescriptionOverride())
                .hidden(dto.getHidden() != null ? dto.getHidden() : false)
                .build();

        SurveyQuestionLinkEntity saved = linkRepository.save(link);

        SurveyQuestionLinkDto linkDto = surveyMapper.toLinkDto(saved);
        linkDto.setQuestion(questionMapper.toDto(question));
        return linkDto;
    }

    /**
     * Update a question link in a survey.
     */
    public SurveyQuestionLinkDto updateQuestionLink(UUID surveyId, UUID linkId, UpdateSurveyQuestionLinkDto dto) {
        SurveyQuestionLinkEntity link = linkRepository.findByIdAndSurveyId(linkId, surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey question link", "id", linkId));

        if (dto.getOrderIndex() != null) {
            link.setOrderIndex(dto.getOrderIndex());
        }
        if (dto.getRequiredOverride() != null) {
            link.setRequiredOverride(dto.getRequiredOverride());
        }
        if (dto.getLabelOverride() != null) {
            link.setLabelOverride(dto.getLabelOverride());
        }
        if (dto.getDescriptionOverride() != null) {
            link.setDescriptionOverride(dto.getDescriptionOverride());
        }
        if (dto.getHidden() != null) {
            link.setHidden(dto.getHidden());
        }

        SurveyQuestionLinkEntity saved = linkRepository.save(link);

        SurveyQuestionLinkDto linkDto = surveyMapper.toLinkDto(saved);
        linkDto.setQuestion(questionMapper.toDto(link.getQuestion()));
        return linkDto;
    }

    /**
     * Remove a question from a survey.
     */
    public void removeQuestionFromSurvey(UUID surveyId, UUID linkId) {
        SurveyQuestionLinkEntity link = linkRepository.findByIdAndSurveyId(linkId, surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey question link", "id", linkId));

        int removedOrder = link.getOrderIndex();
        linkRepository.delete(link);

        // Reorder remaining links
        linkRepository.decrementOrderIndicesAfter(surveyId, removedOrder);
    }

    /**
     * Get question links for a survey.
     */
    @Transactional(readOnly = true)
    public List<SurveyQuestionLinkDto> getQuestionLinks(UUID surveyId) {
        surveyRepository.findByIdAndArchivedFalse(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));

        return linkRepository.findBySurveyIdOrderByOrderIndexAsc(surveyId).stream()
                .map(link -> {
                    SurveyQuestionLinkDto dto = surveyMapper.toLinkDto(link);
                    dto.setQuestion(questionMapper.toDto(link.getQuestion()));
                    return dto;
                })
                .toList();
    }

    /**
     * Validate that a survey can be published.
     */
    private void validateSurveyForPublishing(SurveyEntity survey) {
        long questionCount = linkRepository.countBySurveyId(survey.getId());
        if (questionCount == 0) {
            throw new ValidationException("A survey must have at least one question to be published");
        }
    }

    /**
     * Export a survey with all questions and configuration.
     */
    @Transactional(readOnly = true)
    public SurveyExportDto exportSurvey(UUID surveyId) {
        SurveyEntity survey = surveyRepository.findByIdAndArchivedFalse(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));

        List<SurveyQuestionLinkEntity> links = linkRepository.findBySurveyIdOrderByOrderIndexAsc(surveyId);

        List<SurveyExportDto.ExportQuestionLinkDto> questionLinks = links.stream()
                .map(link -> {
                    QuestionEntity question = link.getQuestion();
                    
                    List<SurveyExportDto.ExportQuestionOptionDto> options = question.getOptions().stream()
                            .map(opt -> SurveyExportDto.ExportQuestionOptionDto.builder()
                                    .label(opt.getLabel())
                                    .orderIndex(opt.getOrderIndex())
                                    .build())
                            .toList();

                    SurveyExportDto.ExportQuestionDto questionDto = SurveyExportDto.ExportQuestionDto.builder()
                            .id(question.getId())
                            .title(question.getTitle())
                            .description(question.getDescription())
                            .type(question.getType())
                            .required(question.isRequired())
                            .maxLength(question.getMaxLength())
                            .linearScaleConfig(questionMapper.toLinearScaleConfigDto(question.getLinearScaleConfig()))
                            .options(options.isEmpty() ? null : options)
                            .build();

                    return SurveyExportDto.ExportQuestionLinkDto.builder()
                            .orderIndex(link.getOrderIndex())
                            .requiredOverride(link.getRequiredOverride())
                            .labelOverride(link.getLabelOverride())
                            .descriptionOverride(link.getDescriptionOverride())
                            .hidden(link.isHidden())
                            .question(questionDto)
                            .build();
                })
                .toList();

        return SurveyExportDto.builder()
                .id(survey.getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .published(survey.isPublished())
                .questions(questionLinks)
                .build();
    }

    /**
     * Import a survey. Creates new questions if they don't exist (no ID or ID not found),
     * updates existing questions if they exist (matched by ID).
     */
    public SurveyDto importSurvey(SurveyExportDto importData) {
        // Create or update the survey
        SurveyEntity survey;
        boolean isUpdate = importData.getId() != null && surveyRepository.existsById(importData.getId());
        
        if (isUpdate) {
            survey = surveyRepository.findById(importData.getId()).orElseThrow();
            survey.setTitle(importData.getTitle());
            survey.setDescription(importData.getDescription());
            survey.setPublished(Boolean.TRUE.equals(importData.getPublished()));
            survey = surveyRepository.save(survey);
            
            // Remove existing links and flush to avoid constraint violations
            linkRepository.deleteBySurveyId(survey.getId());
            linkRepository.flush();
        } else {
            survey = SurveyEntity.builder()
                    .title(importData.getTitle())
                    .description(importData.getDescription())
                    .published(Boolean.TRUE.equals(importData.getPublished()))
                    .build();
            survey = surveyRepository.save(survey);
        }

        // Process questions and links
        if (importData.getQuestions() != null) {
            for (SurveyExportDto.ExportQuestionLinkDto linkData : importData.getQuestions()) {
                SurveyExportDto.ExportQuestionDto questionData = linkData.getQuestion();
                
                // Create or update question
                QuestionEntity question;
                if (questionData.getId() != null && questionService.existsById(questionData.getId())) {
                    // Update existing question
                    QuestionDto dto = QuestionDto.builder()
                            .title(questionData.getTitle())
                            .description(questionData.getDescription())
                            .type(questionData.getType())
                            .required(questionData.getRequired())
                            .maxLength(questionData.getMaxLength())
                            .linearScaleConfig(questionData.getLinearScaleConfig())
                            .options(questionData.getOptions() != null ? 
                                    questionData.getOptions().stream()
                                            .map(opt -> QuestionOptionDto.builder()
                                                    .label(opt.getLabel())
                                                    .orderIndex(opt.getOrderIndex())
                                                    .build())
                                            .toList() : null)
                            .build();
                    questionService.updateQuestion(questionData.getId(), dto);
                    question = questionService.getEntityById(questionData.getId());
                } else {
                    // Create new question
                    QuestionDto dto = QuestionDto.builder()
                            .title(questionData.getTitle())
                            .description(questionData.getDescription())
                            .type(questionData.getType())
                            .required(questionData.getRequired())
                            .maxLength(questionData.getMaxLength())
                            .linearScaleConfig(questionData.getLinearScaleConfig())
                            .options(questionData.getOptions() != null ? 
                                    questionData.getOptions().stream()
                                            .map(opt -> QuestionOptionDto.builder()
                                                    .label(opt.getLabel())
                                                    .orderIndex(opt.getOrderIndex())
                                                    .build())
                                            .toList() : null)
                            .build();
                    QuestionDto created = questionService.createQuestion(dto);
                    question = questionService.getEntityById(created.getId());
                }

                // Create link
                SurveyQuestionLinkEntity link = SurveyQuestionLinkEntity.builder()
                        .survey(survey)
                        .question(question)
                        .orderIndex(linkData.getOrderIndex())
                        .requiredOverride(linkData.getRequiredOverride())
                        .labelOverride(linkData.getLabelOverride())
                        .descriptionOverride(linkData.getDescriptionOverride())
                        .hidden(Boolean.TRUE.equals(linkData.getHidden()))
                        .build();
                
                linkRepository.save(link);
            }
        }

        return surveyMapper.toDto(survey);
    }
}
