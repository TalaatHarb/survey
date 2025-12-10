package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.talaatharb.survey.entity.QuestionType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for survey-question links with resolved effective values.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyQuestionLinkDto {
    
    private UUID id;
    
    private UUID surveyId;
    
    private UUID questionId;
    
    private Integer orderIndex;
    
    // Overrides (nullable)
    private Boolean requiredOverride;
    private String labelOverride;
    private String descriptionOverride;
    private Boolean hidden;
    
    // Resolved/effective values
    private String effectiveLabel;
    private String effectiveDescription;
    private Boolean effectivelyRequired;
    
    // Question details (for display)
    private QuestionType questionType;
    private QuestionDto question;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
