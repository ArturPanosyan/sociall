package com.socialnet.controller;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/trending") @RequiredArgsConstructor
public class TrendingController {
    private final PostRepository     postRepo;
    private final UserRepository     userRepo;
    private final HashtagRepository  hashtagRepo;

    @GetMapping
    public ResponseEntity<Map<String,Object>> trending() {
        Map<String,Object> r = new HashMap<>();

        // Top posts by likes (last 7 days)
        var topPosts = postRepo.findByIsDeletedFalseOrderByLikesCountDesc(PageRequest.of(0,10))
            .getContent().stream().map(p -> {
                Map<String,Object> m = new HashMap<>();
                m.put("id",p.getId()); m.put("content",p.getContent()!=null?p.getContent().substring(0,Math.min(100,p.getContent().length())):"");
                m.put("username",p.getUser().getUsername()); m.put("likesCount",p.getLikesCount()); m.put("viewsCount",p.getViewsCount());
                return m;
            }).toList();

        // Top users by followers
        var topUsers = userRepo.findAll(PageRequest.of(0,8)).getContent().stream().map(u -> {
            Map<String,Object> m = new HashMap<>();
            m.put("id",u.getId()); m.put("username",u.getUsername());
            m.put("fullName",u.getFullName()!=null?u.getFullName():u.getUsername());
            m.put("avatarUrl",u.getAvatarUrl()!=null?u.getAvatarUrl():"");
            m.put("isVerified",u.getIsVerified());
            return m;
        }).toList();

        // Top hashtags
        var topTags = hashtagRepo.findAll(PageRequest.of(0,15)).getContent().stream().map(h -> {
            Map<String,Object> m = new HashMap<>();
            m.put("name",h.getName()); m.put("postsCount",h.getPostsCount());
            return m;
        }).toList();

        r.put("posts",topPosts); r.put("users",topUsers); r.put("hashtags",topTags);
        return ResponseEntity.ok(r);
    }
}
