package net.talaatharb.survey.mapper;

import net.talaatharb.survey.dto.SurveyDto;
import net.talaatharb.survey.dto.SurveyQuestionLinkDto;
import net.talaatharb.survey.entity.SurveyEntity;
import net.talaatharb.survey.entity.SurveyQuestionLinkEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * MapStruct mapper for Survey entities and DTOs.
 */
@Mapper(componentModel = "spring", uses = {QuestionMapper.class})
public interface SurveyMapper {

    @Mapping(target = "questionCount", expression = "java(entity.getQuestionLinks() != null ? entity.getQuestionLinks().size() : 0)")
    SurveyDto toDto(SurveyEntity entity);

    List<SurveyDto> toDtoList(List<SurveyEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "questionLinks", ignore = true)
    SurveyEntity toEntity(SurveyDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "questionLinks", ignore = true)
    void updateEntity(SurveyDto dto, @MappingTarget SurveyEntity entity);

    @Mapping(target = "surveyId", source = "survey.id")
    @Mapping(target = "questionId", source = "question.id")
    @Mapping(target = "questionType", source = "question.type")
    @Mapping(target = "effectiveLabel", expression = "java(entity.getEffectiveLabel())")
    @Mapping(target = "effectiveDescription", expression = "java(entity.getEffectiveDescription())")
    @Mapping(target = "effectivelyRequired", expression = "java(entity.isEffectivelyRequired())")
    SurveyQuestionLinkDto toLinkDto(SurveyQuestionLinkEntity entity);

    List<SurveyQuestionLinkDto> toLinkDtoList(List<SurveyQuestionLinkEntity> entities);
}
