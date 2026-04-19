package com.socialnet.repository;
import com.socialnet.entity.Job;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findByStatusOrderByCreatedAtDesc(Job.JobStatus status, Pageable p);
    @Query("SELECT j FROM Job j WHERE j.status='OPEN' AND (LOWER(j.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(j.category) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Job> search(@Param("q") String q, Pageable p);
    Page<Job> findByStatusAndJobTypeOrderByCreatedAtDesc(Job.JobStatus s, String type, Pageable p);
}
