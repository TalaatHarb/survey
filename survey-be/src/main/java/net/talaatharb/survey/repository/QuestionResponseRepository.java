package net.talaatharb.survey.repository;

import net.talaatharb.survey.entity.QuestionResponseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for QuestionResponse entities.
 */
@Repository
public interface QuestionResponseRepository extends JpaRepository<QuestionResponseEntity, UUID> {

    /**
     * Find all responses for a survey response.
     */
    List<QuestionResponseEntity> findBySurveyResponseId(UUID surveyResponseId);

    /**
     * Find all responses for a specific question across all survey responses.
     */
    List<QuestionResponseEntity> findByQuestionId(UUID questionId);

    /**
     * Find all responses for a specific question in a specific survey.
     */
    @Query("SELECT qr FROM QuestionResponseEntity qr " +
           "JOIN qr.surveyResponse sr " +
           "WHERE sr.surveyId = :surveyId AND qr.questionId = :questionId")
    List<QuestionResponseEntity> findBySurveyIdAndQuestionId(
            @Param("surveyId") UUID surveyId,
            @Param("questionId") UUID questionId);

    /**
     * Count responses for a question in a survey.
     */
    @Query("SELECT COUNT(qr) FROM QuestionResponseEntity qr " +
           "JOIN qr.surveyResponse sr " +
           "WHERE sr.surveyId = :surveyId AND qr.questionId = :questionId")
    long countBySurveyIdAndQuestionId(
            @Param("surveyId") UUID surveyId,
            @Param("questionId") UUID questionId);

    /**
     * Get average numeric answer for a question (for linear scale).
     */
    @Query("SELECT AVG(qr.numericAnswer) FROM QuestionResponseEntity qr " +
           "JOIN qr.surveyResponse sr " +
           "WHERE sr.surveyId = :surveyId AND qr.questionId = :questionId " +
           "AND qr.numericAnswer IS NOT NULL")
    Double getAverageNumericAnswer(
            @Param("surveyId") UUID surveyId,
            @Param("questionId") UUID questionId);

    /**
     * Count numeric answers by value (for linear scale distribution).
     */
    @Query("SELECT qr.numericAnswer, COUNT(qr) FROM QuestionResponseEntity qr " +
           "JOIN qr.surveyResponse sr " +
           "WHERE sr.surveyId = :surveyId AND qr.questionId = :questionId " +
           "AND qr.numericAnswer IS NOT NULL " +
           "GROUP BY qr.numericAnswer " +
           "ORDER BY qr.numericAnswer")
    List<Object[]> countNumericAnswersByValue(
            @Param("surveyId") UUID surveyId,
            @Param("questionId") UUID questionId);
}
