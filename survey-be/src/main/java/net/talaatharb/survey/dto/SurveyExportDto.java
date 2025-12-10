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

import java.util.List;
import java.util.UUID;

/**
 * DTO for full survey export including all nested objects.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyExportDto {
    
    private UUID id;
    
    @NotBlank(message = "Survey title is required")
    @Size(max = 500, message = "Title must be less than 500 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;
    
    private Boolean published;
    
    @Valid
    private List<ExportQuestionLinkDto> questions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportQuestionLinkDto {
        private Integer orderIndex;
        private Boolean requiredOverride;
        private String labelOverride;
        private String descriptionOverride;
        private Boolean hidden;
        
        @Valid
        @NotNull
        private ExportQuestionDto question;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportQuestionDto {
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
        private List<ExportQuestionOptionDto> options;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportQuestionOptionDto {
        @NotBlank(message = "Option label is required")
        private String label;
        
        private Integer orderIndex;
    }
}
