package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "communities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(unique = true, nullable = false)
    private String slug;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "avatar_url")
    private String avatarUrl;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CommunityType type = CommunityType.PUBLIC;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;
    @Column(name = "members_count")
    @Builder.Default
    private Integer membersCount = 0;
    @ManyToMany
    @JoinTable(name = "community_members",
            joinColumns = @JoinColumn(name = "community_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private List<User> members = new ArrayList<>();
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum CommunityType {PUBLIC, PRIVATE}
}
