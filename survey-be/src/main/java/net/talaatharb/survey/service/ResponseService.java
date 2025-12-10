package net.talaatharb.survey.service;

import lombok.RequiredArgsConstructor;
import net.talaatharb.survey.dto.*;
import net.talaatharb.survey.entity.*;
import net.talaatharb.survey.exception.ForbiddenException;
import net.talaatharb.survey.exception.ResourceNotFoundException;
import net.talaatharb.survey.exception.ValidationException;
import net.talaatharb.survey.mapper.QuestionMapper;
import net.talaatharb.survey.mapper.ResponseMapper;
import net.talaatharb.survey.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for handling survey responses.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ResponseService {

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionLinkRepository linkRepository;
    private final SurveyResponseRepository responseRepository;
    private final QuestionOptionRepository optionRepository;
    private final ResponseMapper responseMapper;
    private final QuestionMapper questionMapper;

    /**
     * Get a published survey for public viewing.
     */
    @Transactional(readOnly = true)
    public PublicSurveyDto getPublicSurvey(UUID surveyId) {
        SurveyEntity survey = surveyRepository.findByIdAndPublishedTrueAndArchivedFalse(surveyId)
                .orElseThrow(() -> new ForbiddenException("Survey is not available"));

        List<SurveyQuestionLinkEntity> links = linkRepository
                .findBySurveyIdAndHiddenFalseOrderByOrderIndexAsc(surveyId);

        List<PublicSurveyDto.PublicQuestionDto> questions = links.stream()
                .map(link -> {
                    QuestionEntity q = link.getQuestion();
                    return PublicSurveyDto.PublicQuestionDto.builder()
                            .questionId(q.getId())
                            .title(link.getEffectiveLabel())
                            .description(link.getEffectiveDescription())
                            .type(q.getType())
                            .required(link.isEffectivelyRequired())
                            .maxLength(q.getMaxLength())
                            .linearScaleConfig(questionMapper.toLinearScaleConfigDto(q.getLinearScaleConfig()))
                            .options(q.getOptions().stream()
                                    .map(opt -> PublicSurveyDto.PublicOptionDto.builder()
                                            .id(opt.getId())
                                            .label(opt.getLabel())
                                            .build())
                                    .toList())
                            .build();
                })
                .toList();

        return PublicSurveyDto.builder()
                .id(survey.getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .questions(questions)
                .build();
    }

    /**
     * Submit a survey response.
     */
    public SurveyResponseDto submitResponse(UUID surveyId, SubmitSurveyResponseDto dto, String submitterIp) {
        // Verify survey is published
        SurveyEntity survey = surveyRepository.findByIdAndPublishedTrueAndArchivedFalse(surveyId)
                .orElseThrow(() -> new ForbiddenException("Survey is not accepting responses"));

        // Get required questions
        List<SurveyQuestionLinkEntity> links = linkRepository
                .findBySurveyIdAndHiddenFalseOrderByOrderIndexAsc(surveyId);

        Map<UUID, SurveyQuestionLinkEntity> linkByQuestionId = links.stream()
                .collect(Collectors.toMap(l -> l.getQuestion().getId(), l -> l));

        // Validate response
        validateResponse(dto, linkByQuestionId);

        // Create response entity
        SurveyResponseEntity response = SurveyResponseEntity.builder()
                .surveyId(surveyId)
                .submitterId(dto.getSubmitterId())
                .submitterIp(submitterIp)
                .build();

        // Process answers
        for (QuestionResponseDto answerDto : dto.getAnswers()) {
            SurveyQuestionLinkEntity link = linkByQuestionId.get(answerDto.getQuestionId());
            if (link == null) {
                continue; // Skip answers for unknown questions
            }

            QuestionEntity question = link.getQuestion();
            AnswerType answerType = determineAnswerType(question.getType());

            QuestionResponseEntity questionResponse = QuestionResponseEntity.builder()
                    .questionId(answerDto.getQuestionId())
                    .answerType(answerType)
                    .textAnswer(answerDto.getTextAnswer())
                    .numericAnswer(answerDto.getNumericAnswer())
                    .build();

            // Handle selected options with label snapshot
            if (answerDto.getSelectedOptionIds() != null && !answerDto.getSelectedOptionIds().isEmpty()) {
                List<QuestionOptionEntity> options = optionRepository.findByIdIn(answerDto.getSelectedOptionIds());
                Map<UUID, QuestionOptionEntity> optionMap = options.stream()
                        .collect(Collectors.toMap(QuestionOptionEntity::getId, o -> o));

                for (UUID optionId : answerDto.getSelectedOptionIds()) {
                    QuestionOptionEntity option = optionMap.get(optionId);
                    if (option != null) {
                        QuestionResponseSelectedOptionEntity selectedOption = QuestionResponseSelectedOptionEntity.builder()
                                .optionId(optionId)
                                .labelSnapshot(option.getLabel())
                                .build();
                        questionResponse.addSelectedOption(selectedOption);
                    }
                }
            }

            response.addQuestionResponse(questionResponse);
        }

        SurveyResponseEntity saved = responseRepository.save(response);
        return responseMapper.toDto(saved);
    }

    /**
     * Get responses for a survey (admin).
     */
    @Transactional(readOnly = true)
    public Page<SurveyResponseSummaryDto> getResponsesForSurvey(UUID surveyId, Pageable pageable) {
        surveyRepository.findByIdAndArchivedFalse(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));

        return responseRepository.findBySurveyIdOrderBySubmittedAtDesc(surveyId, pageable)
                .map(responseMapper::toSummaryDto);
    }

    /**
     * Get a single response by ID.
     */
    @Transactional(readOnly = true)
    public SurveyResponseDto getResponseById(UUID surveyId, UUID responseId) {
        SurveyResponseEntity response = responseRepository.findByIdAndSurveyId(responseId, surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Response", "id", responseId));

        return responseMapper.toDto(response);
    }

    /**
     * Validate a survey response.
     */
    private void validateResponse(SubmitSurveyResponseDto dto, Map<UUID, SurveyQuestionLinkEntity> linkByQuestionId) {
        Set<UUID> answeredQuestionIds = dto.getAnswers().stream()
                .map(QuestionResponseDto::getQuestionId)
                .collect(Collectors.toSet());

        // Check required questions
        for (SurveyQuestionLinkEntity link : linkByQuestionId.values()) {
            if (link.isEffectivelyRequired() && !answeredQuestionIds.contains(link.getQuestion().getId())) {
                throw new ValidationException("Required question not answered: " + link.getEffectiveLabel());
            }
        }

        // Validate individual answers
        for (QuestionResponseDto answer : dto.getAnswers()) {
            SurveyQuestionLinkEntity link = linkByQuestionId.get(answer.getQuestionId());
            if (link == null) {
                continue;
            }
            validateAnswer(answer, link.getQuestion());
        }
    }

    /**
     * Validate a single answer.
     */
    private void validateAnswer(QuestionResponseDto answer, QuestionEntity question) {
        switch (question.getType()) {
            case SHORT_ANSWER:
            case PARAGRAPH:
                if (answer.getTextAnswer() != null && question.getMaxLength() != null) {
                    if (answer.getTextAnswer().length() > question.getMaxLength()) {
                        throw new ValidationException("Answer exceeds maximum length for question: " + question.getTitle());
                    }
                }
                break;

            case MULTIPLE_CHOICE:
            case DROPDOWN:
                if (answer.getSelectedOptionIds() != null && answer.getSelectedOptionIds().size() > 1) {
                    throw new ValidationException("Only one option can be selected for: " + question.getTitle());
                }
                validateOptionIds(answer.getSelectedOptionIds(), question);
                break;

            case CHECKBOXES:
                validateOptionIds(answer.getSelectedOptionIds(), question);
                break;

            case LINEAR_SCALE:
                if (answer.getNumericAnswer() != null) {
                    LinearScaleConfig config = question.getLinearScaleConfig();
                    if (config != null) {
                        if (answer.getNumericAnswer() < config.getMinValue() || 
                            answer.getNumericAnswer() > config.getMaxValue()) {
                            throw new ValidationException("Scale value out of range for: " + question.getTitle());
                        }
                    }
                }
                break;

            default:
                break;
        }
    }

    /**
     * Validate that selected option IDs belong to the question.
     */
    private void validateOptionIds(List<UUID> optionIds, QuestionEntity question) {
        if (optionIds == null || optionIds.isEmpty()) {
            return;
        }

        Set<UUID> validOptionIds = question.getOptions().stream()
                .map(QuestionOptionEntity::getId)
                .collect(Collectors.toSet());

        for (UUID optionId : optionIds) {
            if (!validOptionIds.contains(optionId)) {
                throw new ValidationException("Invalid option selected for question: " + question.getTitle());
            }
        }
    }

    /**
     * Determine the answer type based on question type.
     */
    private AnswerType determineAnswerType(QuestionType questionType) {
        return switch (questionType) {
            case SHORT_ANSWER, PARAGRAPH -> AnswerType.TEXT;
            case MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN -> AnswerType.SELECTION;
            case LINEAR_SCALE -> AnswerType.NUMERIC;
            case DATE -> AnswerType.DATE;
            case TIME -> AnswerType.TIME;
        };
    }
}
