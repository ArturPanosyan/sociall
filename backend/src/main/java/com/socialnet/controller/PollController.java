package com.socialnet.controller;

import com.socialnet.entity.*;
import com.socialnet.exception.BadRequestException;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/polls")
@RequiredArgsConstructor
public class PollController {

    private final PollRepository      pollRepo;
    private final PollOptionRepository optionRepo;
    private final PostRepository      postRepo;
    private final UserRepository      userRepo;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPoll(
            @RequestBody CreatePollRequest req,
            @AuthenticationPrincipal UserDetails ud) {

        Post post = postRepo.findById(req.postId())
                .orElseThrow(() -> new NotFoundException("Post not found"));

        Poll poll = Poll.builder()
                .post(post)
                .question(req.question())
                .endsAt(LocalDateTime.now().plusHours(req.durationHours() != null ? req.durationHours() : 24))
                .isMultipleChoice(req.multipleChoice() != null && req.multipleChoice())
                .build();
        poll = pollRepo.save(poll);

        for (String opt : req.options()) {
            PollOption o = PollOption.builder().poll(poll).text(opt).build();
            optionRepo.save(o);
        }
        return ResponseEntity.ok(mapPoll(pollRepo.findById(poll.getId()).orElseThrow(), null));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<Map<String, Object>> getPollByPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails ud) {
        Poll poll = pollRepo.findByPostId(postId)
                .orElseThrow(() -> new NotFoundException("Poll not found"));
        User user = ud != null ? userRepo.findByUsername(ud.getUsername()).orElse(null) : null;
        return ResponseEntity.ok(mapPoll(poll, user));
    }

    @PostMapping("/{pollId}/vote/{optionId}")
    public ResponseEntity<Map<String, Object>> vote(
            @PathVariable Long pollId,
            @PathVariable Long optionId,
            @AuthenticationPrincipal UserDetails ud) {

        Poll poll = pollRepo.findById(pollId)
                .orElseThrow(() -> new NotFoundException("Poll not found"));
        User user = userRepo.findByUsername(ud.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (poll.getEndsAt() != null && LocalDateTime.now().isAfter(poll.getEndsAt()))
            throw new BadRequestException("Poll has ended");

        // Снять предыдущий голос
        poll.getOptions().forEach(o -> {
            if (o.getVoters().removeIf(v -> v.getId().equals(user.getId()))) {
                o.setVotesCount(Math.max(0, o.getVotesCount() - 1));
                optionRepo.save(o);
            }
        });

        // Добавить новый голос
        PollOption option = poll.getOptions().stream()
                .filter(o -> o.getId().equals(optionId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Option not found"));

        option.getVoters().add(user);
        option.setVotesCount(option.getVotesCount() + 1);
        optionRepo.save(option);

        return ResponseEntity.ok(mapPoll(pollRepo.findById(pollId).orElseThrow(), user));
    }

    private Map<String, Object> mapPoll(Poll poll, User user) {
        int total = poll.getOptions().stream().mapToInt(PollOption::getVotesCount).sum();
        Long voted = user == null ? null : poll.getOptions().stream()
                .filter(o -> o.getVoters().stream().anyMatch(v -> v.getId().equals(user.getId())))
                .map(PollOption::getId).findFirst().orElse(null);

        List<Map<String, Object>> opts = poll.getOptions().stream().map(o -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", o.getId());
            m.put("text", o.getText());
            m.put("votes", o.getVotesCount());
            m.put("pct", total > 0 ? Math.round(o.getVotesCount() * 100.0 / total) : 0);
            return m;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("id", poll.getId());
        result.put("question", poll.getQuestion());
        result.put("options", opts);
        result.put("totalVotes", total);
        result.put("votedOptionId", voted);
        result.put("endsAt", poll.getEndsAt() != null ? poll.getEndsAt().toString() : null);
        result.put("ended", poll.getEndsAt() != null && LocalDateTime.now().isAfter(poll.getEndsAt()));
        return result;
    }

    record CreatePollRequest(Long postId, String question, List<String> options,
                              Integer durationHours, Boolean multipleChoice) {}
}
