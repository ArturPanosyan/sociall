package com.socialnet.controller;
import com.socialnet.entity.Gift;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/gifts") @RequiredArgsConstructor
public class GiftController {
    private final GiftRepository giftRepo;
    private final UserRepository userRepo;

    @PostMapping("/send")
    public ResponseEntity<Map<String,Object>> send(
            @RequestBody SendGiftReq req,
            @AuthenticationPrincipal UserDetails ud) {
        User sender   = getUser(ud.getUsername());
        User receiver = getUser(req.toUsername());
        Gift gift = Gift.builder()
                .sender(sender).receiver(receiver)
                .emoji(req.emoji()).label(req.label()).coins(req.coins())
                .message(req.message()).entityType(req.entityType()).entityId(req.entityId()).build();
        giftRepo.save(gift);
        Map<String,Object> r = new HashMap<>();
        r.put("success", true); r.put("gift", req.emoji()+" "+req.label());
        return ResponseEntity.ok(r);
    }

    @GetMapping("/received/{username}")
    public ResponseEntity<Map<String,Object>> received(
            @PathVariable String username,
            @RequestParam(defaultValue="0") int page) {
        Page<Gift> gifts = giftRepo.findByReceiverUsernameOrderByCreatedAtDesc(username, PageRequest.of(page, 20));
        Long total = giftRepo.sumCoinsByReceiver(username);
        Map<String,Object> r = new HashMap<>();
        r.put("gifts", gifts.map(this::mapG));
        r.put("totalCoins", total != null ? total : 0);
        return ResponseEntity.ok(r);
    }

    private User getUser(String u) { return userRepo.findByUsername(u).orElseThrow(() -> new NotFoundException("User not found")); }
    private Map<String,Object> mapG(Gift g) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",g.getId()); m.put("emoji",g.getEmoji()); m.put("label",g.getLabel());
        m.put("coins",g.getCoins()); m.put("message",g.getMessage()!=null?g.getMessage():"");
        m.put("senderUsername",g.getSender().getUsername());
        m.put("senderFullName",g.getSender().getFullName()!=null?g.getSender().getFullName():g.getSender().getUsername());
        m.put("createdAt",g.getCreatedAt().toString());
        return m;
    }
    record SendGiftReq(String toUsername, String emoji, String label, Integer coins, String message, String entityType, Long entityId) {}
}
