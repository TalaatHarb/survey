package net.talaatharb.survey.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing a selected option in a question response.
 * Stores the label at submission time for historical accuracy.
 */
@Entity
@Table(name = "question_response_selected_options",
       indexes = {
           @Index(name = "idx_qrso_question_response", columnList = "question_response_id"),
           @Index(name = "idx_qrso_option", columnList = "option_id")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "questionResponse")
public class QuestionResponseSelectedOptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_response_id", nullable = false)
    private QuestionResponseEntity questionResponse;

    /**
     * Reference to the original option.
     */
    @Column(name = "option_id", nullable = false)
    private UUID optionId;

    /**
     * Snapshot of the option label at the time of submission.
     * This preserves the label even if the original option is later modified.
     */
    @Column(name = "label_snapshot", nullable = false)
    private String labelSnapshot;
}
