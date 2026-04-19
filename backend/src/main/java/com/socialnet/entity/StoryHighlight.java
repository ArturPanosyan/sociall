package com.socialnet.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name="story_highlights")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoryHighlight {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user;
    @Column(nullable=false) private String title;
    @Column(name="cover_url") private String coverUrl;
    @Column(name="emoji") @Builder.Default private String emoji = "⭐";
    @CreationTimestamp @Column(name="created_at") private LocalDateTime createdAt;
}
