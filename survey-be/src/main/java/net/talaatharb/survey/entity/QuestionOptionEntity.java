package net.talaatharb.survey.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing an option for multiple choice, checkbox, or dropdown questions.
 */
@Entity
@Table(name = "question_options", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"question_id", "order_index"}),
       indexes = @Index(name = "idx_question_options_question", columnList = "question_id"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "question")
public class QuestionOptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionEntity question;

    @Column(nullable = false)
    private String label;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
