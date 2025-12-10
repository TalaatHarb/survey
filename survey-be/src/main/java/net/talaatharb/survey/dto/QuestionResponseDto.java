package net.talaatharb.survey.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO for a single question response within a survey submission.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponseDto {
    
    private UUID id;
    
    @NotNull(message = "Question ID is required")
    private UUID questionId;
    
    /**
     * Text answer for SHORT_ANSWER, PARAGRAPH, DATE (yyyy-MM-dd), TIME (HH:mm) questions.
     */
    private String textAnswer;
    
    /**
     * Selected option IDs for MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN questions.
     */
    private List<UUID> selectedOptionIds;
    
    /**
     * Numeric answer for LINEAR_SCALE questions.
     */
    private Integer numericAnswer;
}
