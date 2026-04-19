package com.socialnet.controller;
import com.socialnet.entity.Badge;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/badges") @RequiredArgsConstructor
public class BadgeController {
    private final BadgeRepository badgeRepo;
    private final UserRepository  userRepo;
    private final PostRepository  postRepo;

    @GetMapping("/{username}")
    public ResponseEntity<List<Map<String,Object>>> getBadges(@PathVariable String username) {
        return ResponseEntity.ok(badgeRepo.findByUserUsernameOrderByEarnedAtDesc(username)
                .stream().map(this::map).toList());
    }

    // Auto-check and award badges
    @PostMapping("/check")
    public ResponseEntity<List<Map<String,Object>>> checkAndAward(
            @AuthenticationPrincipal UserDetails ud) {
        User user = userRepo.findByUsername(ud.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        List<Badge> awarded = new ArrayList<>();
        long posts = postRepo.countByUserAndIsDeletedFalse(user);

        // First Post
        if (posts >= 1 && !badgeRepo.existsByUserUsernameAndType(ud.getUsername(),"FIRST_POST")) {
            awarded.add(award(user, "First Post!", "📝", "Published your first post", "FIRST_POST"));
        }
        // 10 Posts
        if (posts >= 10 && !badgeRepo.existsByUserUsernameAndType(ud.getUsername(),"POSTS_10")) {
            awarded.add(award(user, "Content Creator", "🚀", "Published 10 posts", "POSTS_10"));
        }
        // 50 Posts
        if (posts >= 50 && !badgeRepo.existsByUserUsernameAndType(ud.getUsername(),"POSTS_50")) {
            awarded.add(award(user, "Influencer", "⭐", "Published 50 posts", "POSTS_50"));
        }
        return ResponseEntity.ok(awarded.stream().map(this::map).toList());
    }

    private Badge award(User user, String name, String emoji, String desc, String type) {
        return badgeRepo.save(Badge.builder().user(user).name(name).emoji(emoji).description(desc).type(type).build());
    }

    private Map<String,Object> map(Badge b) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",b.getId()); m.put("name",b.getName()); m.put("emoji",b.getEmoji());
        m.put("description",b.getDescription()); m.put("type",b.getType());
        m.put("earnedAt",b.getEarnedAt().toString());
        return m;
    }
}
