package com.socialnet.service;

import com.socialnet.dto.response.CommentResponse;
import com.socialnet.entity.Comment;
import com.socialnet.entity.Notification;
import com.socialnet.entity.Post;
import com.socialnet.entity.User;
import com.socialnet.exception.ForbiddenException;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.CommentRepository;
import com.socialnet.repository.PostRepository;
import com.socialnet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository   commentRepo;
    private final PostRepository      postRepo;
    private final UserRepository      userRepo;
    private final NotificationService notifService;

    // ─── Получить комментарии поста ───────────────────────────
    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(Long postId, Pageable pageable) {
        Post post = getPost(postId);
        return commentRepo.findTopLevelByPost(post, pageable)
                .map(c -> mapToResponse(c, true));
    }

    // ─── Добавить комментарий ─────────────────────────────────
    @Transactional
    public CommentResponse addComment(Long postId, String content,
                                      Long parentId, String username) {
        User user = getUser(username);
        Post post = getPost(postId);

        Comment parent = null;
        if (parentId != null) {
            parent = commentRepo.findById(parentId)
                    .orElseThrow(() -> new NotFoundException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .parent(parent)
                .content(content)
                .build();

        comment = commentRepo.save(comment);
        postRepo.incrementComments(postId);

        // Уведомить автора поста
        if (!post.getUser().getId().equals(user.getId())) {
            notifService.notify(post.getUser(), user,
                    Notification.NotifType.COMMENT, "POST", postId);
        }

        // Уведомить автора родительского комментария
        if (parent != null && !parent.getUser().getId().equals(user.getId())) {
            notifService.notify(parent.getUser(), user,
                    Notification.NotifType.MENTION, "COMMENT", comment.getId());
        }

        log.info("Comment added to post {} by {}", postId, username);
        return mapToResponse(comment, false);
    }

    // ─── Удалить комментарий ──────────────────────────────────
    @Transactional
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        User user = getUser(username);

        if (!comment.getUser().getId().equals(user.getId())
                && user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Cannot delete another user's comment");
        }

        comment.setIsDeleted(true);
        commentRepo.save(comment);
        postRepo.decrementLikes(comment.getPost().getId());
    }

    // ─── Лайк комментария ─────────────────────────────────────
    @Transactional
    public void toggleLike(Long commentId) {
        commentRepo.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        commentRepo.incrementLikes(commentId);
    }

    // ─── Helpers ──────────────────────────────────────────────
    private Post getPost(Long id) {
        return postRepo.findById(id).orElseThrow(() -> new NotFoundException("Post not found"));
    }
    private User getUser(String username) {
        return userRepo.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found"));
    }

    CommentResponse mapToResponse(Comment c, boolean includeReplies) {
        List<CommentResponse> replies = includeReplies
                ? commentRepo.findReplies(c.getId()).stream()
                    .map(r -> mapToResponse(r, false)).toList()
                : List.of();

        return CommentResponse.builder()
                .id(c.getId())
                .postId(c.getPost().getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .userId(c.getUser().getId())
                .username(c.getUser().getUsername())
                .fullName(c.getUser().getFullName())
                .avatarUrl(c.getUser().getAvatarUrl())
                .content(c.getContent())
                .likesCount(c.getLikesCount())
                .replies(replies)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
