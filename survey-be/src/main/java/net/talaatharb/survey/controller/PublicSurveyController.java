package net.talaatharb.survey.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.talaatharb.survey.dto.PublicSurveyDto;
import net.talaatharb.survey.dto.SubmitSurveyResponseDto;
import net.talaatharb.survey.dto.SurveyResponseDto;
import net.talaatharb.survey.service.ResponseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

/**
 * REST controller for public survey APIs (respondent access).
 */
@RestController
@RequestMapping("/v1/public/surveys")
@RequiredArgsConstructor
public class PublicSurveyController {

    private final ResponseService responseService;

    /**
     * Get a published survey for responding.
     */
    @GetMapping("/{surveyId}")
    public ResponseEntity<PublicSurveyDto> getPublicSurvey(@PathVariable UUID surveyId) {
        PublicSurveyDto survey = responseService.getPublicSurvey(surveyId);
        return ResponseEntity.ok(survey);
    }

    /**
     * Submit a response to a survey.
     */
    @PostMapping("/{surveyId}/responses")
    public ResponseEntity<SurveyResponseDto> submitResponse(
            @PathVariable UUID surveyId,
            @Valid @RequestBody SubmitSurveyResponseDto dto,
            HttpServletRequest request) {
        
        // Get submitter IP for rate limiting/tracking
        String submitterIp = getClientIpAddress(request);
        
        SurveyResponseDto response = responseService.submitResponse(surveyId, dto, submitterIp);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(location)
                .body(response);
    }

    /**
     * Get a submitted response (for confirmation page).
     */
    @GetMapping("/{surveyId}/responses/{responseId}")
    public ResponseEntity<SurveyResponseDto> getResponse(
            @PathVariable UUID surveyId,
            @PathVariable UUID responseId) {
        SurveyResponseDto response = responseService.getResponseById(surveyId, responseId);
        return ResponseEntity.ok(response);
    }

    /**
     * Extract client IP address from request.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
