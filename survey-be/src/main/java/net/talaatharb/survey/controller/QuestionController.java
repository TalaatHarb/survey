package net.talaatharb.survey.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.talaatharb.survey.dto.QuestionDto;
import net.talaatharb.survey.service.QuestionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for managing questions (admin/editor APIs).
 */
@RestController
@RequestMapping("/v1/admin/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    /**
     * Get all questions with pagination and optional search.
     */
    @GetMapping
    public ResponseEntity<Page<QuestionDto>> getAllQuestions(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<QuestionDto> questions = questionService.searchQuestions(search, pageable);
        return ResponseEntity.ok(questions);
    }

    /**
     * Get a question by ID.
     */
    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionDto> getQuestion(@PathVariable UUID questionId) {
        QuestionDto question = questionService.getQuestionById(questionId);
        return ResponseEntity.ok(question);
    }

    /**
     * Create a new question.
     */
    @PostMapping
    public ResponseEntity<QuestionDto> createQuestion(@Valid @RequestBody QuestionDto dto) {
        QuestionDto created = questionService.createQuestion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update a question.
     */
    @PutMapping("/{questionId}")
    public ResponseEntity<QuestionDto> updateQuestion(
            @PathVariable UUID questionId,
            @Valid @RequestBody QuestionDto dto) {
        QuestionDto updated = questionService.updateQuestion(questionId, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete (archive) a question.
     */
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Copy a question.
     */
    @PostMapping("/{questionId}/copy")
    public ResponseEntity<QuestionDto> copyQuestion(@PathVariable UUID questionId) {
        QuestionDto copied = questionService.copyQuestion(questionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(copied);
    }
}
