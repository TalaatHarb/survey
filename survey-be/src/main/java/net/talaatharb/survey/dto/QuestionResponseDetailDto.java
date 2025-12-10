package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.talaatharb.survey.entity.AnswerType;

import java.util.List;
import java.util.UUID;

/**
 * DTO for detailed question response (with labels).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponseDetailDto {
    
    private UUID id;
    
    private UUID questionId;
    
    private String questionTitle;
    
    private AnswerType answerType;
    
    private String textAnswer;
    
    private Integer numericAnswer;
    
    /**
     * Selected options with their labels.
     */
    private List<SelectedOptionDto> selectedOptions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectedOptionDto {
        private UUID optionId;
        private String label;
    }
}
