package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"conversation_id","user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConversationMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING) @Builder.Default
    private MemberRole role = MemberRole.MEMBER;

    @CreationTimestamp @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    public enum MemberRole { MEMBER, ADMIN }
}
