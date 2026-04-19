package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "live_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id")
    private User host;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "room_key", unique = true)
    private String roomKey;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RoomType type = RoomType.AUDIO;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RoomStatus status = RoomStatus.LIVE;
    @Column(name = "listeners_count")
    @Builder.Default
    private Integer listenersCount = 0;
    @ManyToMany
    @JoinTable(name = "room_listeners",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private List<User> listeners = new ArrayList<>();
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum RoomType {AUDIO, VIDEO}

    public enum RoomStatus {LIVE, ENDED}
}
