package net.talaatharb.survey.repository;

import net.talaatharb.survey.entity.QuestionResponseSelectedOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for QuestionResponseSelectedOption entities.
 */
@Repository
public interface QuestionResponseSelectedOptionRepository extends JpaRepository<QuestionResponseSelectedOptionEntity, UUID> {

    /**
     * Find all selected options for a question response.
     */
    List<QuestionResponseSelectedOptionEntity> findByQuestionResponseId(UUID questionResponseId);

    /**
     * Count selections per option for a question in a survey.
     */
    @Query("SELECT so.optionId, so.labelSnapshot, COUNT(so) " +
           "FROM QuestionResponseSelectedOptionEntity so " +
           "JOIN so.questionResponse qr " +
           "JOIN qr.surveyResponse sr " +
           "WHERE sr.surveyId = :surveyId AND qr.questionId = :questionId " +
           "GROUP BY so.optionId, so.labelSnapshot " +
           "ORDER BY COUNT(so) DESC")
    List<Object[]> countSelectionsPerOption(
            @Param("surveyId") UUID surveyId,
            @Param("questionId") UUID questionId);
}
