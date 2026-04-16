package com.socialnet.controller;

import com.socialnet.entity.Post;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import com.socialnet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController @RequestMapping("/api/reels") @RequiredArgsConstructor
public class ReelController {
    private final PostRepository     postRepo;
    private final UserRepository     userRepo;
    private final LikeRepository     likeRepo;
    private final FileStorageService fileStorage;

    @GetMapping
    public ResponseEntity<Page<Map<String,Object>>> getFeed(
            @RequestParam(defaultValue="0") int page,
            @AuthenticationPrincipal UserDetails ud) {
        User me = userRepo.findByUsername(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(
            postRepo.findByTypeAndIsDeletedFalseOrderByCreatedAtDesc(
                Post.PostType.REEL, PageRequest.of(page, 10))
            .map(r -> mapReel(r, me)));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Map<String,Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required=false) String caption,
            @AuthenticationPrincipal UserDetails ud) {
        User user = userRepo.findByUsername(ud.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        String url = fileStorage.uploadPostMedia(file);
        Post reel = Post.builder().user(user)
                .content(caption != null ? caption : "")
                .mediaUrls("[\"" + url + "\"]")
                .type(Post.PostType.REEL).visibility(Post.Visibility.PUBLIC).build();
        return ResponseEntity.ok(mapReel(postRepo.save(reel), user));
    }

    private Map<String,Object> mapReel(Post p, User me) {
        Map<String,Object> m = new HashMap<>();
        m.put("id", p.getId()); m.put("caption", p.getContent() != null ? p.getContent() : "");
        m.put("videoUrl", extractFirst(p.getMediaUrls()));
        m.put("username", p.getUser().getUsername());
        m.put("fullName", p.getUser().getFullName() != null ? p.getUser().getFullName() : p.getUser().getUsername());
        m.put("avatarUrl", p.getUser().getAvatarUrl() != null ? p.getUser().getAvatarUrl() : "");
        m.put("likesCount", p.getLikesCount()); m.put("commentsCount", p.getCommentsCount());
        m.put("isLiked", likeRepo.existsByUserAndPost(me, p));
        m.put("createdAt", p.getCreatedAt().toString());
        return m;
    }
    private String extractFirst(String json) {
        if (json == null || json.isBlank()) return "";
        return json.replaceAll("[\\[\\]\"\\s]","").split(",")[0];
    }
}
