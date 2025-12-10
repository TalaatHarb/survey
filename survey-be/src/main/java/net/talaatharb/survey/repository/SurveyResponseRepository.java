package net.talaatharb.survey.repository;

import net.talaatharb.survey.entity.SurveyResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for SurveyResponse entities.
 */
@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponseEntity, UUID> {

    /**
     * Find all responses for a survey, ordered by submission time descending.
     */
    Page<SurveyResponseEntity> findBySurveyIdOrderBySubmittedAtDesc(UUID surveyId, Pageable pageable);

    /**
     * Find a response by ID and survey ID.
     */
    Optional<SurveyResponseEntity> findByIdAndSurveyId(UUID id, UUID surveyId);

    /**
     * Count responses for a survey.
     */
    long countBySurveyId(UUID surveyId);

    /**
     * Find responses for a survey within a date range.
     */
    @Query("SELECT r FROM SurveyResponseEntity r WHERE r.surveyId = :surveyId " +
           "AND r.submittedAt >= :startDate AND r.submittedAt <= :endDate " +
           "ORDER BY r.submittedAt DESC")
    List<SurveyResponseEntity> findBySurveyIdAndDateRange(
            @Param("surveyId") UUID surveyId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Count responses per day for a survey (for time series analytics).
     */
    @Query("SELECT CAST(r.submittedAt AS LocalDate), COUNT(r) " +
           "FROM SurveyResponseEntity r WHERE r.surveyId = :surveyId " +
           "GROUP BY CAST(r.submittedAt AS LocalDate) " +
           "ORDER BY CAST(r.submittedAt AS LocalDate)")
    List<Object[]> countResponsesPerDay(@Param("surveyId") UUID surveyId);
}
