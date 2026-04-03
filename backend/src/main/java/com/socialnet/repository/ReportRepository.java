package com.socialnet.repository;

import com.socialnet.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByStatusOrderByCreatedAtDesc(Report.ReportStatus status, Pageable pageable);
    boolean existsByReporterIdAndEntityTypeAndEntityId(Long reporterId, String type, Long entityId);
}
