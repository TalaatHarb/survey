package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for updating a survey-question link.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSurveyQuestionLinkDto {
    
    private Integer orderIndex;
    
    private Boolean requiredOverride;
    
    private String labelOverride;
    
    private String descriptionOverride;
    
    private Boolean hidden;
}
