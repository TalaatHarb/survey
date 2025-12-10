package net.talaatharb.survey.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing the many-to-many relationship between surveys and questions,
 * with additional metadata like ordering and per-link overrides.
 */
@Entity
@Table(name = "survey_question_links",
       indexes = {
           @Index(name = "idx_survey_question_links_survey_order", columnList = "survey_id, order_index"),
           @Index(name = "idx_survey_question_links_question", columnList = "question_id")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"survey", "question"})
public class SurveyQuestionLinkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private SurveyEntity survey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionEntity question;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    /**
     * Override for required field. If null, use QuestionEntity.required.
     */
    private Boolean requiredOverride;

    /**
     * Override for question label/title in this specific survey.
     */
    private String labelOverride;

    /**
     * Override for question description in this specific survey.
     */
    @Column(length = 2000)
    private String descriptionOverride;

    /**
     * Whether the question is hidden in this specific survey.
     */
    @Builder.Default
    @Column(nullable = false)
    private boolean hidden = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Resolves whether this question is required, considering the override.
     */
    public boolean isEffectivelyRequired() {
        return requiredOverride != null ? requiredOverride : question.isRequired();
    }

    /**
     * Resolves the effective label, considering the override.
     */
    public String getEffectiveLabel() {
        return labelOverride != null ? labelOverride : question.getTitle();
    }

    /**
     * Resolves the effective description, considering the override.
     */
    public String getEffectiveDescription() {
        return descriptionOverride != null ? descriptionOverride : question.getDescription();
    }
}
