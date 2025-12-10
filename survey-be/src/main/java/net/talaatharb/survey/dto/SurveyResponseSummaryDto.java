package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for survey response summary (list view).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponseSummaryDto {
    
    private UUID id;
    
    private UUID surveyId;
    
    private LocalDateTime submittedAt;
    
    private String submitterId;
    
    private Integer answerCount;
}
