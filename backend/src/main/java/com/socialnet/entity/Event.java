package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "start_at")
    private LocalDateTime startAt;
    @Column(name = "end_at")
    private LocalDateTime endAt;
    private String location;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventType type = EventType.PUBLIC;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;
    @Column(name = "attendees_count")
    @Builder.Default
    private Integer attendeesCount = 0;
    @ManyToMany
    @JoinTable(name = "event_attendees",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private List<User> attendees = new ArrayList<>();
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum EventType {PUBLIC, PRIVATE, ONLINE}
}
