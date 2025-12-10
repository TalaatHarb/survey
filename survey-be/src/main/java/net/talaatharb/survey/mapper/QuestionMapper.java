package net.talaatharb.survey.mapper;

import net.talaatharb.survey.dto.LinearScaleConfigDto;
import net.talaatharb.survey.dto.QuestionDto;
import net.talaatharb.survey.dto.QuestionOptionDto;
import net.talaatharb.survey.entity.LinearScaleConfig;
import net.talaatharb.survey.entity.QuestionEntity;
import net.talaatharb.survey.entity.QuestionOptionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * MapStruct mapper for Question entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface QuestionMapper {

    QuestionDto toDto(QuestionEntity entity);

    List<QuestionDto> toDtoList(List<QuestionEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "surveyLinks", ignore = true)
    @Mapping(target = "options", ignore = true)
    QuestionEntity toEntity(QuestionDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "surveyLinks", ignore = true)
    @Mapping(target = "options", ignore = true)
    void updateEntity(QuestionDto dto, @MappingTarget QuestionEntity entity);

    QuestionOptionDto toOptionDto(QuestionOptionEntity entity);

    List<QuestionOptionDto> toOptionDtoList(List<QuestionOptionEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "question", ignore = true)
    QuestionOptionEntity toOptionEntity(QuestionOptionDto dto);

    LinearScaleConfigDto toLinearScaleConfigDto(LinearScaleConfig config);

    LinearScaleConfig toLinearScaleConfig(LinearScaleConfigDto dto);
}
