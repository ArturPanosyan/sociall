package com.socialnet.controller;

import com.socialnet.dto.request.CreatePostRequest;
import com.socialnet.dto.response.PostResponse;
import com.socialnet.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // ─── Лента (feed) ─────────────────────────────────────────
    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> getFeed(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(postService.getFeed(user.getUsername(), pageable));
    }

    // ─── Посты пользователя ───────────────────────────────────
    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PostResponse>> getUserPosts(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(postService.getUserPosts(username, pageable));
    }

    // ─── Один пост ────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPost(id));
    }

    // ─── Создать пост ─────────────────────────────────────────
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestPart("post") CreatePostRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(postService.createPost(request, files, user.getUsername()));
    }

    // ─── Удалить пост ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        postService.deletePost(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ─── Лайк ────────────────────────────────────────────────
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        postService.toggleLike(id, user.getUsername());
        return ResponseEntity.ok().build();
    }

    // ─── Поиск по хэштегу ─────────────────────────────────────
    @GetMapping("/hashtag/{tag}")
    public ResponseEntity<Page<PostResponse>> getByHashtag(
            @PathVariable String tag,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(postService.getPostsByHashtag(tag, pageable));
    }
}
