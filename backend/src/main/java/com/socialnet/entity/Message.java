package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "media_url", length = 500)
    private String mediaUrl;

    @Enumerated(EnumType.STRING) @Builder.Default
    private MsgType type = MsgType.TEXT;

    @Column(name = "is_read") @Builder.Default
    private Boolean isRead = false;

    @Column(name = "is_deleted") @Builder.Default
    private Boolean isDeleted = false;

    @CreationTimestamp @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum MsgType { TEXT, IMAGE, VIDEO, FILE, VOICE }
}
