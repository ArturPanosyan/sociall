package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;
    @Column(nullable = false)
    private String title;
    private String description;
    private String category;
    @Column(name = "plays_count")
    @Builder.Default
    private Integer playsCount = 0;
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuizQuestion> questions = new ArrayList<>();
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private QuizStatus status = QuizStatus.PUBLISHED;
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum QuizStatus {DRAFT, PUBLISHED}
}
