package com.socialnet.controller;
import com.socialnet.entity.LiveRoom;
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

@RestController @RequestMapping("/api/rooms") @RequiredArgsConstructor
public class LiveRoomController {
    private final LiveRoomRepository roomRepo;
    private final UserRepository     userRepo;

    @GetMapping
    public ResponseEntity<Page<Map<String,Object>>> list(@RequestParam(defaultValue="0") int page) {
        return ResponseEntity.ok(roomRepo.findByStatusOrderByListenersCountDesc(
            LiveRoom.RoomStatus.LIVE, PageRequest.of(page, 20)).map(this::map));
    }

    @PostMapping
    public ResponseEntity<Map<String,Object>> create(@RequestBody CreateRoomReq req,
            @AuthenticationPrincipal UserDetails ud) {
        User host = getUser(ud.getUsername());
        String key = UUID.randomUUID().toString().substring(0, 8);
        LiveRoom room = LiveRoom.builder().host(host).title(req.title())
                .description(req.description())
                .type(req.type() != null ? LiveRoom.RoomType.valueOf(req.type()) : LiveRoom.RoomType.AUDIO)
                .roomKey(key).listenersCount(1).startedAt(LocalDateTime.now()).build();
        room.getListeners().add(host);
        return ResponseEntity.ok(map(roomRepo.save(room)));
    }

    @PostMapping("/{key}/join")
    public ResponseEntity<Map<String,Object>> join(@PathVariable String key,
            @AuthenticationPrincipal UserDetails ud) {
        LiveRoom room = roomRepo.findByRoomKey(key).orElseThrow(() -> new NotFoundException("Room not found"));
        User user = getUser(ud.getUsername());
        if (!room.getListeners().contains(user)) {
            room.getListeners().add(user);
            room.setListenersCount(room.getListenersCount() + 1);
            roomRepo.save(room);
        }
        return ResponseEntity.ok(map(room));
    }

    @PostMapping("/{key}/end")
    public ResponseEntity<Void> end(@PathVariable String key, @AuthenticationPrincipal UserDetails ud) {
        LiveRoom room = roomRepo.findByRoomKey(key).orElseThrow(() -> new NotFoundException("Room not found"));
        if (room.getHost().getUsername().equals(ud.getUsername())) {
            room.setStatus(LiveRoom.RoomStatus.ENDED);
            room.setEndedAt(LocalDateTime.now());
            roomRepo.save(room);
        }
        return ResponseEntity.ok().build();
    }

    private User getUser(String u) { return userRepo.findByUsername(u).orElseThrow(() -> new NotFoundException("User not found")); }
    private Map<String,Object> map(LiveRoom r) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",r.getId()); m.put("title",r.getTitle());
        m.put("description",r.getDescription()!=null?r.getDescription():"");
        m.put("roomKey",r.getRoomKey()); m.put("type",r.getType().name());
        m.put("status",r.getStatus().name()); m.put("listenersCount",r.getListenersCount());
        m.put("hostUsername",r.getHost().getUsername());
        m.put("hostFullName",r.getHost().getFullName()!=null?r.getHost().getFullName():r.getHost().getUsername());
        m.put("hostAvatar",r.getHost().getAvatarUrl()!=null?r.getHost().getAvatarUrl():"");
        m.put("startedAt",r.getStartedAt()!=null?r.getStartedAt().toString():"");
        return m;
    }
    record CreateRoomReq(String title, String description, String type) {}
}
