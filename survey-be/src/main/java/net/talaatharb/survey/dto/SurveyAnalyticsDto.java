package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.talaatharb.survey.entity.QuestionType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for survey analytics/results.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyAnalyticsDto {
    
    private UUID surveyId;
    
    private String surveyTitle;
    
    private Long totalSubmissions;
    
    /**
     * Submissions per day for time series.
     */
    private List<DailySubmissionCount> submissionsOverTime;
    
    /**
     * Analytics per question.
     */
    private List<QuestionAnalyticsDto> questionAnalytics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySubmissionCount {
        private String date;
        private Long count;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionAnalyticsDto {
        private UUID questionId;
        private String questionTitle;
        private QuestionType questionType;
        private Long totalResponses;
        
        /**
         * For MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN: option counts.
         */
        private List<OptionCount> optionCounts;
        
        /**
         * For LINEAR_SCALE: distribution by value.
         */
        private Map<Integer, Long> scaleDistribution;
        private Double scaleAverage;
        private Double scaleMedian;
        
        /**
         * For SHORT_ANSWER, PARAGRAPH: sample responses.
         */
        private List<String> textSamples;
        
        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class OptionCount {
            private UUID optionId;
            private String label;
            private Long count;
            private Double percentage;
        }
    }
}
