package net.talaatharb.survey.repository;

import net.talaatharb.survey.entity.SurveyQuestionLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for SurveyQuestionLink entities (many-to-many relationship).
 */
@Repository
public interface SurveyQuestionLinkRepository extends JpaRepository<SurveyQuestionLinkEntity, UUID> {

    /**
     * Find all links for a survey, ordered by orderIndex.
     */
    List<SurveyQuestionLinkEntity> findBySurveyIdOrderByOrderIndexAsc(UUID surveyId);

    /**
     * Find a link by survey ID and question ID.
     */
    Optional<SurveyQuestionLinkEntity> findBySurveyIdAndQuestionId(UUID surveyId, UUID questionId);

    /**
     * Find a link by ID and survey ID.
     */
    Optional<SurveyQuestionLinkEntity> findByIdAndSurveyId(UUID id, UUID surveyId);

    /**
     * Delete all links for a survey.
     */
    void deleteBySurveyId(UUID surveyId);

    /**
     * Count links for a survey.
     */
    long countBySurveyId(UUID surveyId);

    /**
     * Get the maximum order index for a survey.
     */
    @Query("SELECT COALESCE(MAX(l.orderIndex), -1) FROM SurveyQuestionLinkEntity l WHERE l.survey.id = :surveyId")
    int getMaxOrderIndex(@Param("surveyId") UUID surveyId);

    /**
     * Update order indices for links with indices greater than the given value.
     */
    @Modifying
    @Query("UPDATE SurveyQuestionLinkEntity l SET l.orderIndex = l.orderIndex - 1 " +
           "WHERE l.survey.id = :surveyId AND l.orderIndex > :orderIndex")
    void decrementOrderIndicesAfter(@Param("surveyId") UUID surveyId, @Param("orderIndex") int orderIndex);

    /**
     * Find non-hidden links for a survey (for public display).
     */
    List<SurveyQuestionLinkEntity> findBySurveyIdAndHiddenFalseOrderByOrderIndexAsc(UUID surveyId);
}
