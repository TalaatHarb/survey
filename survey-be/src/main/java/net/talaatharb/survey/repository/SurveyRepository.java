package net.talaatharb.survey.repository;

import net.talaatharb.survey.entity.SurveyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Survey entities.
 */
@Repository
public interface SurveyRepository extends JpaRepository<SurveyEntity, UUID> {

    /**
     * Find all non-archived surveys with pagination.
     */
    Page<SurveyEntity> findByArchivedFalse(Pageable pageable);

    /**
     * Find a survey by ID that is not archived.
     */
    Optional<SurveyEntity> findByIdAndArchivedFalse(UUID id);

    /**
     * Find a published survey by ID (for public access).
     */
    Optional<SurveyEntity> findByIdAndPublishedTrueAndArchivedFalse(UUID id);

    /**
     * Search surveys by title containing the search term.
     */
    @Query("SELECT s FROM SurveyEntity s WHERE s.archived = false AND LOWER(s.title) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<SurveyEntity> searchByTitle(@Param("search") String search, Pageable pageable);

    /**
     * Count the number of question links for a survey.
     */
    @Query("SELECT COUNT(l) FROM SurveyQuestionLinkEntity l WHERE l.survey.id = :surveyId")
    long countQuestionLinks(@Param("surveyId") UUID surveyId);
}
