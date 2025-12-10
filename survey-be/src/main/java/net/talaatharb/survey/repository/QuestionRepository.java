package net.talaatharb.survey.repository;

import net.talaatharb.survey.entity.QuestionEntity;
import net.talaatharb.survey.entity.QuestionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Question entities (global question bank).
 */
@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, UUID> {

    /**
     * Find all non-archived questions with pagination.
     */
    Page<QuestionEntity> findByArchivedFalse(Pageable pageable);

    /**
     * Find a question by ID that is not archived.
     */
    Optional<QuestionEntity> findByIdAndArchivedFalse(UUID id);

    /**
     * Search questions by title or description.
     */
    @Query("SELECT q FROM QuestionEntity q WHERE q.archived = false AND " +
           "(LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<QuestionEntity> searchByTitleOrDescription(@Param("search") String search, Pageable pageable);

    /**
     * Find questions by type.
     */
    Page<QuestionEntity> findByTypeAndArchivedFalse(QuestionType type, Pageable pageable);

    /**
     * Count non-archived questions.
     */
    long countByArchivedFalse();
}
