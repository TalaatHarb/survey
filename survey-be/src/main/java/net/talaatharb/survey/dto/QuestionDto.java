package net.talaatharb.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.talaatharb.survey.entity.QuestionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for questions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    
    private UUID id;
    
    @NotBlank(message = "Question title is required")
    @Size(max = 500, message = "Title must be less than 500 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;
    
    @NotNull(message = "Question type is required")
    private QuestionType type;
    
    private Boolean required;
    
    private Integer maxLength;
    
    @Valid
    private LinearScaleConfigDto linearScaleConfig;
    
    @Valid
    private List<QuestionOptionDto> options;
    
    private Boolean archived;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
