package net.talaatharb.survey.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.talaatharb.survey.dto.*;
import net.talaatharb.survey.service.AnalyticsService;
import net.talaatharb.survey.service.ResponseService;
import net.talaatharb.survey.service.SurveyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing surveys (admin/editor APIs).
 */
@RestController
@RequestMapping("/v1/admin/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;
    private final ResponseService responseService;
    private final AnalyticsService analyticsService;

    // ==================== Survey CRUD ====================

    /**
     * Get all surveys with pagination and optional search.
     */
    @GetMapping
    public ResponseEntity<Page<SurveyDto>> getAllSurveys(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SurveyDto> surveys = surveyService.searchSurveys(search, pageable);
        return ResponseEntity.ok(surveys);
    }

    /**
     * Get a survey by ID with full details.
     */
    @GetMapping("/{surveyId}")
    public ResponseEntity<SurveyDto> getSurvey(@PathVariable UUID surveyId) {
        SurveyDto survey = surveyService.getSurveyById(surveyId);
        return ResponseEntity.ok(survey);
    }

    /**
     * Create a new survey.
     */
    @PostMapping
    public ResponseEntity<SurveyDto> createSurvey(@Valid @RequestBody SurveyDto dto) {
        SurveyDto created = surveyService.createSurvey(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update a survey.
     */
    @PutMapping("/{surveyId}")
    public ResponseEntity<SurveyDto> updateSurvey(
            @PathVariable UUID surveyId,
            @Valid @RequestBody SurveyDto dto) {
        SurveyDto updated = surveyService.updateSurvey(surveyId, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete (archive) a survey.
     */
    @DeleteMapping("/{surveyId}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable UUID surveyId) {
        surveyService.deleteSurvey(surveyId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Question Links ====================

    /**
     * Get all question links for a survey.
     */
    @GetMapping("/{surveyId}/links")
    public ResponseEntity<List<SurveyQuestionLinkDto>> getQuestionLinks(@PathVariable UUID surveyId) {
        List<SurveyQuestionLinkDto> links = surveyService.getQuestionLinks(surveyId);
        return ResponseEntity.ok(links);
    }

    /**
     * Add a question to a survey.
     */
    @PostMapping("/{surveyId}/links")
    public ResponseEntity<SurveyQuestionLinkDto> addQuestionToSurvey(
            @PathVariable UUID surveyId,
            @Valid @RequestBody CreateSurveyQuestionLinkDto dto) {
        SurveyQuestionLinkDto link = surveyService.addQuestionToSurvey(surveyId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(link);
    }

    /**
     * Update a question link.
     */
    @PatchMapping("/{surveyId}/links/{linkId}")
    public ResponseEntity<SurveyQuestionLinkDto> updateQuestionLink(
            @PathVariable UUID surveyId,
            @PathVariable UUID linkId,
            @RequestBody UpdateSurveyQuestionLinkDto dto) {
        SurveyQuestionLinkDto link = surveyService.updateQuestionLink(surveyId, linkId, dto);
        return ResponseEntity.ok(link);
    }

    /**
     * Remove a question from a survey.
     */
    @DeleteMapping("/{surveyId}/links/{linkId}")
    public ResponseEntity<Void> removeQuestionFromSurvey(
            @PathVariable UUID surveyId,
            @PathVariable UUID linkId) {
        surveyService.removeQuestionFromSurvey(surveyId, linkId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Results & Analytics ====================

    /**
     * Get analytics for a survey.
     */
    @GetMapping("/{surveyId}/results")
    public ResponseEntity<SurveyAnalyticsDto> getSurveyAnalytics(@PathVariable UUID surveyId) {
        SurveyAnalyticsDto analytics = analyticsService.getSurveyAnalytics(surveyId);
        return ResponseEntity.ok(analytics);
    }

    /**
     * Get all submissions for a survey.
     */
    @GetMapping("/{surveyId}/results/submissions")
    public ResponseEntity<Page<SurveyResponseSummaryDto>> getSubmissions(
            @PathVariable UUID surveyId,
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SurveyResponseSummaryDto> submissions = responseService.getResponsesForSurvey(surveyId, pageable);
        return ResponseEntity.ok(submissions);
    }

    /**
     * Get a single submission.
     */
    @GetMapping("/{surveyId}/results/submissions/{submissionId}")
    public ResponseEntity<SurveyResponseDto> getSubmission(
            @PathVariable UUID surveyId,
            @PathVariable UUID submissionId) {
        SurveyResponseDto submission = responseService.getResponseById(surveyId, submissionId);
        return ResponseEntity.ok(submission);
    }
}
