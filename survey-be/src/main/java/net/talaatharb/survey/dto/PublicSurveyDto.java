package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.talaatharb.survey.entity.QuestionType;

import java.util.List;
import java.util.UUID;

/**
 * DTO for public survey view (for respondents).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicSurveyDto {
    
    private UUID id;
    
    private String title;
    
    private String description;
    
    private List<PublicQuestionDto> questions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicQuestionDto {
        private UUID questionId;
        private String title;
        private String description;
        private QuestionType type;
        private Boolean required;
        private Integer maxLength;
        private LinearScaleConfigDto linearScaleConfig;
        private List<PublicOptionDto> options;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicOptionDto {
        private UUID id;
        private String label;
    }
}
