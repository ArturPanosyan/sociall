package com.socialnet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "poll_options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PollOption {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "poll_id")
    private Poll poll;

    @Column(length = 200) private String text;

    @Column(name = "votes_count") @Builder.Default
    private Integer votesCount = 0;

    @ManyToMany
    @JoinTable(name = "poll_votes",
        joinColumns = @JoinColumn(name = "option_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private List<User> voters = new ArrayList<>();
}
