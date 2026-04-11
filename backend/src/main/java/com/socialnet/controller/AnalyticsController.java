package com.socialnet.controller;

import com.socialnet.entity.User;
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
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final PostRepository  postRepo;
    private final UserRepository  userRepo;
    private final FollowRepository followRepo;
    private final LikeRepository  likeRepo;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfileStats(
            @AuthenticationPrincipal UserDetails ud) {

        User user = userRepo.findByUsername(ud.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));

        long totalPosts    = postRepo.countByUserAndIsDeletedFalse(user);
        long totalFollowers = followRepo.countByFollowingAndStatus(user, com.socialnet.entity.Follow.FollowStatus.ACCEPTED);
        long totalFollowing = followRepo.countByFollowerAndStatus(user, com.socialnet.entity.Follow.FollowStatus.ACCEPTED);

        // Посты за последние 7 дней
        long postsThisWeek = postRepo.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(
                user, org.springframework.data.domain.PageRequest.of(0, 100))
                .stream()
                .filter(p -> p.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7)))
                .count();

        // Суммарные лайки на всех постах
        int totalLikes = postRepo.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(
                user, org.springframework.data.domain.PageRequest.of(0, 100))
                .stream().mapToInt(p -> p.getLikesCount()).sum();

        // Суммарные просмотры
        int totalViews = postRepo.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(
                user, org.springframework.data.domain.PageRequest.of(0, 100))
                .stream().mapToInt(p -> p.getViewsCount()).sum();

        // Топ пост
        Optional<com.socialnet.entity.Post> topPost = postRepo.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(
                user, org.springframework.data.domain.PageRequest.of(0, 100))
                .stream().max(Comparator.comparingInt(p -> p.getLikesCount()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPosts",     totalPosts);
        stats.put("totalFollowers", totalFollowers);
        stats.put("totalFollowing", totalFollowing);
        stats.put("totalLikes",     totalLikes);
        stats.put("totalViews",     totalViews);
        stats.put("postsThisWeek",  postsThisWeek);
        stats.put("engagementRate", totalPosts > 0 ? (totalLikes * 100.0 / Math.max(1, totalViews)) : 0);

        if (topPost.isPresent()) {
            Map<String, Object> tp = new HashMap<>();
            tp.put("id",      topPost.get().getId());
            tp.put("content", topPost.get().getContent() != null ?
                    topPost.get().getContent().substring(0, Math.min(80, topPost.get().getContent().length())) : "");
            tp.put("likes",   topPost.get().getLikesCount());
            tp.put("views",   topPost.get().getViewsCount());
            stats.put("topPost", tp);
        }

        return ResponseEntity.ok(stats);
    }
}
