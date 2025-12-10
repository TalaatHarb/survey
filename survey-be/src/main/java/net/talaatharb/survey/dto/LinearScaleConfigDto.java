package net.talaatharb.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for linear scale configuration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinearScaleConfigDto {
    private Integer minValue;
    private Integer maxValue;
    private Integer step;
    private String leftLabel;
    private String rightLabel;
}
