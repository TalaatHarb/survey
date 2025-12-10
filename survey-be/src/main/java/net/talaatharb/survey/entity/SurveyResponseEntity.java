package net.talaatharb.survey.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a submitted response to a survey.
 */
@Entity
@Table(name = "survey_responses",
       indexes = {
           @Index(name = "idx_survey_responses_survey_submitted", columnList = "survey_id, submitted_at")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "questionResponses")
public class SurveyResponseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "survey_id", nullable = false)
    private UUID surveyId;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "submitter_ip")
    private String submitterIp;

    @Column(name = "submitter_id")
    private String submitterId;

    @Builder.Default
    @OneToMany(mappedBy = "surveyResponse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionResponseEntity> questionResponses = new ArrayList<>();

    /**
     * Helper method to add a question response.
     */
    public void addQuestionResponse(QuestionResponseEntity response) {
        questionResponses.add(response);
        response.setSurveyResponse(this);
    }
}
