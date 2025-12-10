package net.talaatharb.survey.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for surveys.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyDto {
    
    private UUID id;
    
    @NotBlank(message = "Survey title is required")
    @Size(max = 500, message = "Title must be less than 500 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;
    
    private Boolean published;
    
    private Boolean archived;
    
    private List<SurveyQuestionLinkDto> questionLinks;
    
    private Integer questionCount;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
