package net.talaatharb.survey.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a response to a single question within a survey submission.
 */
@Entity
@Table(name = "question_responses",
       indexes = {
           @Index(name = "idx_question_responses_question", columnList = "question_id"),
           @Index(name = "idx_question_responses_survey_response", columnList = "survey_response_id")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"surveyResponse", "selectedOptions"})
public class QuestionResponseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_response_id", nullable = false)
    private SurveyResponseEntity surveyResponse;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "answer_type", nullable = false)
    private AnswerType answerType;

    /**
     * Text answer for SHORT_ANSWER, PARAGRAPH, DATE, TIME questions.
     * Dates stored as ISO format (yyyy-MM-dd), times as (HH:mm).
     */
    @Column(name = "text_answer", length = 10000)
    private String textAnswer;

    /**
     * Numeric answer for LINEAR_SCALE questions.
     */
    @Column(name = "numeric_answer")
    private Integer numericAnswer;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Selected options for MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN questions.
     * Stored with label snapshot for historical accuracy.
     */
    @Builder.Default
    @OneToMany(mappedBy = "questionResponse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionResponseSelectedOptionEntity> selectedOptions = new ArrayList<>();

    /**
     * Helper method to add a selected option.
     */
    public void addSelectedOption(QuestionResponseSelectedOptionEntity option) {
        selectedOptions.add(option);
        option.setQuestionResponse(this);
    }
}
