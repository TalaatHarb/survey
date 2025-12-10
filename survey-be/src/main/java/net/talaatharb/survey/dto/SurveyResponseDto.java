package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for a survey response (submission).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponseDto {
    
    private UUID id;
    
    private UUID surveyId;
    
    private LocalDateTime submittedAt;
    
    private String submitterId;
    
    private List<QuestionResponseDetailDto> answers;
}
