package net.talaatharb.survey.mapper;

import net.talaatharb.survey.dto.QuestionResponseDetailDto;
import net.talaatharb.survey.dto.SurveyResponseDto;
import net.talaatharb.survey.dto.SurveyResponseSummaryDto;
import net.talaatharb.survey.entity.QuestionResponseEntity;
import net.talaatharb.survey.entity.QuestionResponseSelectedOptionEntity;
import net.talaatharb.survey.entity.SurveyResponseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct mapper for Response entities and DTOs.
 */
@Mapper(componentModel = "spring")
public interface ResponseMapper {

    @Mapping(target = "answers", source = "questionResponses")
    SurveyResponseDto toDto(SurveyResponseEntity entity);

    List<SurveyResponseDto> toDtoList(List<SurveyResponseEntity> entities);

    @Mapping(target = "answerCount", expression = "java(entity.getQuestionResponses() != null ? entity.getQuestionResponses().size() : 0)")
    SurveyResponseSummaryDto toSummaryDto(SurveyResponseEntity entity);

    List<SurveyResponseSummaryDto> toSummaryDtoList(List<SurveyResponseEntity> entities);

    @Mapping(target = "questionTitle", ignore = true)
    @Mapping(target = "selectedOptions", source = "selectedOptions")
    QuestionResponseDetailDto toQuestionResponseDetailDto(QuestionResponseEntity entity);

    @Mapping(target = "optionId", source = "optionId")
    @Mapping(target = "label", source = "labelSnapshot")
    QuestionResponseDetailDto.SelectedOptionDto toSelectedOptionDto(QuestionResponseSelectedOptionEntity entity);
}
