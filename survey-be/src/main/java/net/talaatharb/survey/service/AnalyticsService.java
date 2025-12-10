package net.talaatharb.survey.service;

import lombok.RequiredArgsConstructor;
import net.talaatharb.survey.dto.SurveyAnalyticsDto;
import net.talaatharb.survey.dto.SurveyAnalyticsDto.DailySubmissionCount;
import net.talaatharb.survey.dto.SurveyAnalyticsDto.QuestionAnalyticsDto;
import net.talaatharb.survey.dto.SurveyAnalyticsDto.QuestionAnalyticsDto.OptionCount;
import net.talaatharb.survey.entity.QuestionEntity;
import net.talaatharb.survey.entity.SurveyEntity;
import net.talaatharb.survey.entity.SurveyQuestionLinkEntity;
import net.talaatharb.survey.exception.ResourceNotFoundException;
import net.talaatharb.survey.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for survey analytics.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final int MAX_TEXT_SAMPLES = 10;

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionLinkRepository linkRepository;
    private final SurveyResponseRepository responseRepository;
    private final QuestionResponseRepository questionResponseRepository;
    private final QuestionResponseSelectedOptionRepository selectedOptionRepository;

    /**
     * Get analytics for a survey.
     */
    public SurveyAnalyticsDto getSurveyAnalytics(UUID surveyId) {
        SurveyEntity survey = surveyRepository.findByIdAndArchivedFalse(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", "id", surveyId));

        long totalSubmissions = responseRepository.countBySurveyId(surveyId);

        // Get submissions over time
        List<DailySubmissionCount> submissionsOverTime = responseRepository.countResponsesPerDay(surveyId)
                .stream()
                .map(row -> DailySubmissionCount.builder()
                        .date(row[0].toString())
                        .count((Long) row[1])
                        .build())
                .toList();

        // Get question analytics
        List<SurveyQuestionLinkEntity> links = linkRepository.findBySurveyIdOrderByOrderIndexAsc(surveyId);
        List<QuestionAnalyticsDto> questionAnalytics = links.stream()
                .map(link -> buildQuestionAnalytics(surveyId, link.getQuestion(), totalSubmissions))
                .toList();

        return SurveyAnalyticsDto.builder()
                .surveyId(surveyId)
                .surveyTitle(survey.getTitle())
                .totalSubmissions(totalSubmissions)
                .submissionsOverTime(submissionsOverTime)
                .questionAnalytics(questionAnalytics)
                .build();
    }

    /**
     * Build analytics for a single question.
     */
    private QuestionAnalyticsDto buildQuestionAnalytics(UUID surveyId, QuestionEntity question, long totalSubmissions) {
        UUID questionId = question.getId();
        long totalResponses = questionResponseRepository.countBySurveyIdAndQuestionId(surveyId, questionId);

        QuestionAnalyticsDto.QuestionAnalyticsDtoBuilder builder = QuestionAnalyticsDto.builder()
                .questionId(questionId)
                .questionTitle(question.getTitle())
                .questionType(question.getType())
                .totalResponses(totalResponses);

        switch (question.getType()) {
            case MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN:
                builder.optionCounts(buildOptionCounts(surveyId, questionId, totalResponses));
                break;

            case LINEAR_SCALE:
                buildScaleAnalytics(builder, surveyId, questionId);
                break;

            case SHORT_ANSWER, PARAGRAPH:
                builder.textSamples(getTextSamples(surveyId, questionId));
                break;

            default:
                break;
        }

        return builder.build();
    }

    /**
     * Build option counts for choice questions.
     */
    private List<OptionCount> buildOptionCounts(UUID surveyId, UUID questionId, long totalResponses) {
        List<Object[]> counts = selectedOptionRepository.countSelectionsPerOption(surveyId, questionId);

        return counts.stream()
                .map(row -> OptionCount.builder()
                        .optionId((UUID) row[0])
                        .label((String) row[1])
                        .count((Long) row[2])
                        .percentage(totalResponses > 0 ? ((Long) row[2] * 100.0 / totalResponses) : 0)
                        .build())
                .toList();
    }

    /**
     * Build scale analytics.
     */
    private void buildScaleAnalytics(QuestionAnalyticsDto.QuestionAnalyticsDtoBuilder builder,
                                      UUID surveyId, UUID questionId) {
        Double average = questionResponseRepository.getAverageNumericAnswer(surveyId, questionId);
        builder.scaleAverage(average);

        List<Object[]> distribution = questionResponseRepository.countNumericAnswersByValue(surveyId, questionId);
        Map<Integer, Long> scaleDistribution = new HashMap<>();
        List<Integer> values = new ArrayList<>();

        for (Object[] row : distribution) {
            Integer value = (Integer) row[0];
            Long count = (Long) row[1];
            scaleDistribution.put(value, count);
            for (int i = 0; i < count; i++) {
                values.add(value);
            }
        }
        builder.scaleDistribution(scaleDistribution);

        // Calculate median
        if (!values.isEmpty()) {
            Collections.sort(values);
            int middle = values.size() / 2;
            if (values.size() % 2 == 0) {
                builder.scaleMedian((values.get(middle - 1) + values.get(middle)) / 2.0);
            } else {
                builder.scaleMedian((double) values.get(middle));
            }
        }
    }

    /**
     * Get text samples for text questions.
     */
    private List<String> getTextSamples(UUID surveyId, UUID questionId) {
        return questionResponseRepository.findBySurveyIdAndQuestionId(surveyId, questionId)
                .stream()
                .map(qr -> qr.getTextAnswer())
                .filter(Objects::nonNull)
                .filter(text -> !text.isBlank())
                .limit(MAX_TEXT_SAMPLES)
                .toList();
    }
}
