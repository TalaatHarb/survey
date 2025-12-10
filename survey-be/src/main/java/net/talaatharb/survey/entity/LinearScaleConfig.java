package net.talaatharb.survey.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Embeddable configuration for linear scale questions.
 */
@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinearScaleConfig {
    
    private Integer minValue;
    
    private Integer maxValue;
    
    private Integer step;
    
    private String leftLabel;
    
    private String rightLabel;
}
