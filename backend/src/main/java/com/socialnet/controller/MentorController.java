package com.socialnet.controller;
import com.socialnet.entity.MentorSession;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController @RequestMapping("/api/mentor") @RequiredArgsConstructor
public class MentorController {
    private final MentorSessionRepository sessionRepo;
    private final UserRepository          userRepo;

    @GetMapping("/sessions")
    public ResponseEntity<Page<Map<String,Object>>> list(@RequestParam(defaultValue="0") int page) {
        return ResponseEntity.ok(sessionRepo.findByStatusOrderByScheduledAtAsc(
            MentorSession.SessionStatus.PENDING, PageRequest.of(page,20)).map(this::mapS));
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String,Object>> book(@RequestBody BookReq req,
            @AuthenticationPrincipal UserDetails ud) {
        User mentee = getUser(ud.getUsername());
        User mentor = getUser(req.mentorUsername());
        MentorSession s = MentorSession.builder()
                .mentor(mentor).mentee(mentee).topic(req.topic())
                .description(req.description()).price(req.price())
                .durationMin(req.durationMin() != null ? req.durationMin() : 60)
                .scheduledAt(req.scheduledAt() != null ? LocalDateTime.parse(req.scheduledAt()) : LocalDateTime.now().plusDays(1))
                .build();
        return ResponseEntity.ok(mapS(sessionRepo.save(s)));
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String,Object>> my(@AuthenticationPrincipal UserDetails ud) {
        Page<MentorSession> asMentor = sessionRepo.findByMentorUsernameOrderByCreatedAtDesc(ud.getUsername(), PageRequest.of(0,10));
        Page<MentorSession> asMentee = sessionRepo.findByMenteeUsernameOrderByCreatedAtDesc(ud.getUsername(), PageRequest.of(0,10));
        Map<String,Object> r = new HashMap<>();
        r.put("asMentor", asMentor.map(this::mapS));
        r.put("asMentee", asMentee.map(this::mapS));
        return ResponseEntity.ok(r);
    }

    private User getUser(String u) { return userRepo.findByUsername(u).orElseThrow(() -> new NotFoundException("User not found")); }
    private Map<String,Object> mapS(MentorSession s) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",s.getId()); m.put("topic",s.getTopic());
        m.put("description",s.getDescription()!=null?s.getDescription():"");
        m.put("durationMin",s.getDurationMin()); m.put("price",s.getPrice()!=null?s.getPrice():"Free");
        m.put("status",s.getStatus().name());
        m.put("scheduledAt",s.getScheduledAt()!=null?s.getScheduledAt().toString():"");
        m.put("mentorUsername",s.getMentor().getUsername());
        m.put("mentorFullName",s.getMentor().getFullName()!=null?s.getMentor().getFullName():s.getMentor().getUsername());
        m.put("menteeUsername",s.getMentee()!=null?s.getMentee().getUsername():"");
        m.put("createdAt",s.getCreatedAt().toString());
        return m;
    }
    record BookReq(String mentorUsername, String topic, String description, String price, Integer durationMin, String scheduledAt) {}
}
