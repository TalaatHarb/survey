package net.talaatharb.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO for submitting a survey response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitSurveyResponseDto {
    
    @NotNull(message = "Survey ID is required")
    private UUID surveyId;
    
    /**
     * Optional submitter identifier (e.g., user ID or email).
     */
    private String submitterId;
    
    @NotEmpty(message = "At least one answer is required")
    @Valid
    private List<QuestionResponseDto> answers;
}
