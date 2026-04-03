package com.socialnet.controller;

import com.socialnet.entity.Report;
import com.socialnet.entity.User;
import com.socialnet.exception.BadRequestException;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.ReportRepository;
import com.socialnet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepo;
    private final UserRepository   userRepo;

    // POST /api/reports — пожаловаться
    @PostMapping
    public ResponseEntity<Void> submit(
            @RequestBody ReportRequest req,
            @AuthenticationPrincipal UserDetails user) {

        User reporter = userRepo.findByUsername(user.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Защита от повторных жалоб
        if (reportRepo.existsByReporterIdAndEntityTypeAndEntityId(
                reporter.getId(), req.entityType(), req.entityId())) {
            throw new BadRequestException("You have already reported this content");
        }

        reportRepo.save(Report.builder()
                .reporter(reporter)
                .entityType(req.entityType())
                .entityId(req.entityId())
                .reason(Report.ReportReason.valueOf(req.reason()))
                .details(req.details())
                .build());

        return ResponseEntity.ok().build();
    }

    // GET /api/reports — только модераторы и админы
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    public ResponseEntity<Page<Report>> getPending(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
            reportRepo.findByStatusOrderByCreatedAtDesc(Report.ReportStatus.PENDING, pageable));
    }

    // PATCH /api/reports/{id}/review — обработать жалобу
    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    public ResponseEntity<Void> review(
            @PathVariable Long id,
            @RequestBody ReviewRequest req) {
        Report report = reportRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found"));
        report.setStatus(Report.ReportStatus.valueOf(req.status()));
        reportRepo.save(report);
        return ResponseEntity.ok().build();
    }

    record ReportRequest(String entityType, Long entityId, String reason, String details) {}
    record ReviewRequest(String status) {}
}
