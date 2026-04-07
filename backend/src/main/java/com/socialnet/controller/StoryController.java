package com.socialnet.controller;

import com.socialnet.entity.Story;
import com.socialnet.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    // GET /api/stories/feed — stories от подписок
    @GetMapping("/feed")
    public ResponseEntity<Map<String, List<Story>>> getFeed(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(storyService.getFeedStories(user.getUsername()));
    }

    // GET /api/stories/user/{username}
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Story>> getUserStories(@PathVariable String username) {
        return ResponseEntity.ok(storyService.getUserStories(username));
    }

    // POST /api/stories — загрузить story
    @PostMapping
    public ResponseEntity<Story> create(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(storyService.createStory(file, user.getUsername()));
    }

    // POST /api/stories/{id}/view
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> view(@PathVariable Long id) {
        storyService.view(id);
        return ResponseEntity.ok().build();
    }
}
