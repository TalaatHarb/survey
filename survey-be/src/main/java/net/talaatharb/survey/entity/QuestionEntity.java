package net.talaatharb.survey.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a reusable question in the question bank.
 */
@Entity
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"options", "surveyLinks"})
public class QuestionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Builder.Default
    @Column(nullable = false)
    private boolean required = false;

    private Integer maxLength;

    @Embedded
    @AttributeOverride(name = "minValue", column = @Column(name = "scale_min_value"))
    @AttributeOverride(name = "maxValue", column = @Column(name = "scale_max_value"))
    @AttributeOverride(name = "step", column = @Column(name = "scale_step"))
    @AttributeOverride(name = "leftLabel", column = @Column(name = "scale_left_label"))
    @AttributeOverride(name = "rightLabel", column = @Column(name = "scale_right_label"))
    private LinearScaleConfig linearScaleConfig;

    @Builder.Default
    @Column(nullable = false)
    private boolean archived = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<QuestionOptionEntity> options = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "question")
    private List<SurveyQuestionLinkEntity> surveyLinks = new ArrayList<>();

    /**
     * Helper method to add an option.
     */
    public void addOption(QuestionOptionEntity option) {
        options.add(option);
        option.setQuestion(this);
    }

    /**
     * Helper method to remove an option.
     */
    public void removeOption(QuestionOptionEntity option) {
        options.remove(option);
        option.setQuestion(null);
    }
}
