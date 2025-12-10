package net.talaatharb.survey.service;

import lombok.RequiredArgsConstructor;
import net.talaatharb.survey.dto.QuestionDto;
import net.talaatharb.survey.dto.QuestionOptionDto;
import net.talaatharb.survey.entity.QuestionEntity;
import net.talaatharb.survey.entity.QuestionOptionEntity;
import net.talaatharb.survey.entity.QuestionType;
import net.talaatharb.survey.exception.ResourceNotFoundException;
import net.talaatharb.survey.exception.ValidationException;
import net.talaatharb.survey.mapper.QuestionMapper;
import net.talaatharb.survey.repository.QuestionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing questions in the global question bank.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    private static final Set<QuestionType> OPTION_REQUIRED_TYPES = Set.of(
            QuestionType.MULTIPLE_CHOICE,
            QuestionType.CHECKBOXES,
            QuestionType.DROPDOWN
    );

    /**
     * Get all questions with pagination.
     */
    @Transactional(readOnly = true)
    public Page<QuestionDto> getAllQuestions(Pageable pageable) {
        return questionRepository.findByArchivedFalse(pageable)
                .map(questionMapper::toDto);
    }

    /**
     * Search questions by title or description.
     */
    @Transactional(readOnly = true)
    public Page<QuestionDto> searchQuestions(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return getAllQuestions(pageable);
        }
        return questionRepository.searchByTitleOrDescription(search, pageable)
                .map(questionMapper::toDto);
    }

    /**
     * Get a question by ID.
     */
    @Transactional(readOnly = true)
    public QuestionDto getQuestionById(UUID id) {
        QuestionEntity entity = questionRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        return questionMapper.toDto(entity);
    }

    /**
     * Get a question entity by ID (internal use).
     */
    @Transactional(readOnly = true)
    public QuestionEntity getQuestionEntityById(UUID id) {
        return questionRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
    }

    /**
     * Create a new question.
     */
    public QuestionDto createQuestion(QuestionDto dto) {
        validateQuestion(dto);

        QuestionEntity entity = questionMapper.toEntity(dto);
        entity.setId(null); // Ensure new entity

        // Handle options for choice-based questions
        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            for (int i = 0; i < dto.getOptions().size(); i++) {
                QuestionOptionDto optionDto = dto.getOptions().get(i);
                QuestionOptionEntity optionEntity = QuestionOptionEntity.builder()
                        .label(optionDto.getLabel())
                        .orderIndex(optionDto.getOrderIndex() != null ? optionDto.getOrderIndex() : i)
                        .build();
                entity.addOption(optionEntity);
            }
        }

        // Handle linear scale config
        if (dto.getType() == QuestionType.LINEAR_SCALE && dto.getLinearScaleConfig() != null) {
            entity.setLinearScaleConfig(questionMapper.toLinearScaleConfig(dto.getLinearScaleConfig()));
        }

        QuestionEntity saved = questionRepository.save(entity);
        return questionMapper.toDto(saved);
    }

    /**
     * Update an existing question.
     */
    public QuestionDto updateQuestion(UUID id, QuestionDto dto) {
        validateQuestion(dto);

        QuestionEntity entity = questionRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));

        questionMapper.updateEntity(dto, entity);

        // Update options - clear and re-add
        entity.getOptions().clear();
        if (dto.getOptions() != null) {
            for (int i = 0; i < dto.getOptions().size(); i++) {
                QuestionOptionDto optionDto = dto.getOptions().get(i);
                QuestionOptionEntity optionEntity = QuestionOptionEntity.builder()
                        .label(optionDto.getLabel())
                        .orderIndex(optionDto.getOrderIndex() != null ? optionDto.getOrderIndex() : i)
                        .build();
                entity.addOption(optionEntity);
            }
        }

        // Update linear scale config
        if (dto.getType() == QuestionType.LINEAR_SCALE && dto.getLinearScaleConfig() != null) {
            entity.setLinearScaleConfig(questionMapper.toLinearScaleConfig(dto.getLinearScaleConfig()));
        } else {
            entity.setLinearScaleConfig(null);
        }

        QuestionEntity saved = questionRepository.save(entity);
        return questionMapper.toDto(saved);
    }

    /**
     * Delete (archive) a question.
     */
    public void deleteQuestion(UUID id) {
        QuestionEntity entity = questionRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        entity.setArchived(true);
        questionRepository.save(entity);
    }

    /**
     * Copy a question.
     */
    public QuestionDto copyQuestion(UUID id) {
        QuestionEntity original = questionRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));

        QuestionEntity copy = QuestionEntity.builder()
                .title(original.getTitle() + " (Copy)")
                .description(original.getDescription())
                .type(original.getType())
                .required(original.isRequired())
                .maxLength(original.getMaxLength())
                .linearScaleConfig(original.getLinearScaleConfig())
                .build();

        // Copy options
        for (QuestionOptionEntity originalOption : original.getOptions()) {
            QuestionOptionEntity copyOption = QuestionOptionEntity.builder()
                    .label(originalOption.getLabel())
                    .orderIndex(originalOption.getOrderIndex())
                    .build();
            copy.addOption(copyOption);
        }

        QuestionEntity saved = questionRepository.save(copy);
        return questionMapper.toDto(saved);
    }

    /**
     * Validate a question.
     */
    private void validateQuestion(QuestionDto dto) {
        if (dto.getType() == null) {
            throw new ValidationException("Question type is required");
        }

        // Validate options for choice-based questions
        if (OPTION_REQUIRED_TYPES.contains(dto.getType())) {
            if (dto.getOptions() == null || dto.getOptions().isEmpty()) {
                throw new ValidationException("At least one option is required for " + dto.getType());
            }
        }

        // Validate linear scale config
        if (dto.getType() == QuestionType.LINEAR_SCALE) {
            if (dto.getLinearScaleConfig() == null) {
                throw new ValidationException("Linear scale configuration is required for LINEAR_SCALE questions");
            }
            var config = dto.getLinearScaleConfig();
            if (config.getMinValue() == null || config.getMaxValue() == null) {
                throw new ValidationException("Min and max values are required for linear scale");
            }
            if (config.getMinValue() >= config.getMaxValue()) {
                throw new ValidationException("Min value must be less than max value");
            }
            if (config.getStep() != null && config.getStep() <= 0) {
                throw new ValidationException("Step must be greater than 0");
            }
        }
    }
}
