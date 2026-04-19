package com.socialnet.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name="jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="poster_id") private User poster;
    @Column(nullable=false) private String title;
    @Column(columnDefinition="TEXT") private String description;
    private String company;
    private String location;
    private String salary;
    @Column(name="job_type") private String jobType; // FULL_TIME, PART_TIME, REMOTE, FREELANCE
    private String category;
    @Enumerated(EnumType.STRING) @Builder.Default private JobStatus status = JobStatus.OPEN;
    @Column(name="apply_url") private String applyUrl;
    @Column(name="views_count") @Builder.Default private Integer viewsCount = 0;
    @CreationTimestamp @Column(name="created_at") private LocalDateTime createdAt;
    public enum JobStatus { OPEN, CLOSED }
}
