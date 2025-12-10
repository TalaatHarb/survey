package net.talaatharb.survey.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating or updating a survey-question link.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSurveyQuestionLinkDto {
    
    @NotNull(message = "Question ID is required")
    private UUID questionId;
    
    private Integer orderIndex;
    
    private Boolean requiredOverride;
    
    private String labelOverride;
    
    private String descriptionOverride;
    
    private Boolean hidden;
}
