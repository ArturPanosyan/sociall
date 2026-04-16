package com.socialnet.controller;
import com.socialnet.entity.Event;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;
@RestController @RequestMapping("/api/events") @RequiredArgsConstructor
public class EventController {
    private final EventRepository eventRepo;
    private final UserRepository  userRepo;

    @GetMapping
    public ResponseEntity<Page<Map<String,Object>>> upcoming(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(required=false) String q) {
        Pageable p = PageRequest.of(page, 20);
        return ResponseEntity.ok((q != null && !q.isBlank()
                ? eventRepo.search(q, p)
                : eventRepo.findByStartAtAfterOrderByStartAtAsc(LocalDateTime.now(), p)).map(this::mapE));
    }
    @PostMapping
    public ResponseEntity<Map<String,Object>> create(@RequestBody CreateReq req,
            @AuthenticationPrincipal UserDetails ud) {
        User org = getUser(ud.getUsername());
        Event e = Event.builder().title(req.title()).description(req.description()).location(req.location())
                .startAt(req.startAt()!=null ? LocalDateTime.parse(req.startAt()) : LocalDateTime.now().plusDays(7))
                .endAt(req.endAt()!=null ? LocalDateTime.parse(req.endAt()) : LocalDateTime.now().plusDays(7).plusHours(2))
                .type(req.type()!=null ? Event.EventType.valueOf(req.type()) : Event.EventType.PUBLIC)
                .organizer(org).attendeesCount(1).build();
        e.getAttendees().add(org);
        return ResponseEntity.ok(mapE(eventRepo.save(e)));
    }
    @PostMapping("/{id}/rsvp")
    public ResponseEntity<Map<String,Object>> rsvp(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        Event e = eventRepo.findById(id).orElseThrow(() -> new NotFoundException("Not found"));
        User u = getUser(ud.getUsername());
        if (!e.getAttendees().contains(u)) { e.getAttendees().add(u); e.setAttendeesCount(e.getAttendeesCount()+1); }
        else { e.getAttendees().remove(u); e.setAttendeesCount(Math.max(0,e.getAttendeesCount()-1)); }
        return ResponseEntity.ok(mapE(eventRepo.save(e)));
    }
    private User getUser(String u) { return userRepo.findByUsername(u).orElseThrow(() -> new NotFoundException("User not found")); }
    private Map<String,Object> mapE(Event e) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",e.getId()); m.put("title",e.getTitle());
        m.put("description",e.getDescription()!=null?e.getDescription():"");
        m.put("location",e.getLocation()!=null?e.getLocation():"");
        m.put("startAt",e.getStartAt()!=null?e.getStartAt().toString():"");
        m.put("endAt",e.getEndAt()!=null?e.getEndAt().toString():"");
        m.put("type",e.getType().name()); m.put("attendeesCount",e.getAttendeesCount());
        m.put("organizerUsername",e.getOrganizer()!=null?e.getOrganizer().getUsername():"");
        return m;
    }
    record CreateReq(String title, String description, String location, String startAt, String endAt, String type) {}
}
