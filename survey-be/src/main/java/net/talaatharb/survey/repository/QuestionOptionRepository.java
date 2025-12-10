package net.talaatharb.survey.repository;

import net.talaatharb.survey.entity.QuestionOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for QuestionOption entities.
 */
@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOptionEntity, UUID> {

    /**
     * Find all options for a question, ordered by orderIndex.
     */
    List<QuestionOptionEntity> findByQuestionIdOrderByOrderIndexAsc(UUID questionId);

    /**
     * Delete all options for a question.
     */
    void deleteByQuestionId(UUID questionId);

    /**
     * Find options by IDs.
     */
    List<QuestionOptionEntity> findByIdIn(List<UUID> ids);
}
