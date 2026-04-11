package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "polls")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Poll {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(length = 300)
    private String question;

    @Column(name = "ends_at")
    private LocalDateTime endsAt;

    @Column(name = "is_multiple_choice") @Builder.Default
    private Boolean isMultipleChoice = false;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PollOption> options = new ArrayList<>();

    @CreationTimestamp @Column(name = "created_at")
    private LocalDateTime createdAt;
}
