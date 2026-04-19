package com.socialnet.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name="badges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Badge {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String emoji;
    private String description;
    @Column(name="badge_type") private String type; // POSTS, FOLLOWERS, LIKES, EVENTS, etc
    @CreationTimestamp @Column(name="earned_at") private LocalDateTime earnedAt;
}
