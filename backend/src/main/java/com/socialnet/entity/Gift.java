package com.socialnet.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name="gifts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Gift {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="sender_id") private User sender;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="receiver_id") private User receiver;
    @Column(nullable=false) private String emoji;
    @Column(nullable=false) private String label;
    @Column(nullable=false) private Integer coins;
    private String message;
    @Column(name="entity_type") private String entityType;
    @Column(name="entity_id")   private Long   entityId;
    @CreationTimestamp @Column(name="created_at") private LocalDateTime createdAt;
}
