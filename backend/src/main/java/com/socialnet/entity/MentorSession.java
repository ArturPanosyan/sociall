package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentee_id")
    private User mentee;
    @Column(nullable = false)
    private String topic;
    private String description;
    @Column(name = "duration_min")
    @Builder.Default
    private Integer durationMin = 60;
    private String price; // "Free" or "$50"
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.PENDING;
    @Column(name = "meeting_url")
    private String meetingUrl;
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum SessionStatus {PENDING, CONFIRMED, COMPLETED, CANCELLED}
}
