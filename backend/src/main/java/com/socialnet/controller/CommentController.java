package com.socialnet.controller;

import com.socialnet.dto.response.CommentResponse;
import com.socialnet.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // GET /api/posts/{postId}/comments
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable Long postId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(commentService.getComments(postId, pageable));
    }

    // POST /api/posts/{postId}/comments
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            commentService.addComment(postId, req.content(), req.parentId(), user.getUsername()));
    }

    // DELETE /api/comments/{id}
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        commentService.deleteComment(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    // POST /api/comments/{id}/like
    @PostMapping("/comments/{id}/like")
    public ResponseEntity<Void> likeComment(@PathVariable Long id) {
        commentService.toggleLike(id);
        return ResponseEntity.ok().build();
    }

    record CommentRequest(String content, Long parentId) {}
}
