package com.socialnet.service;

import com.socialnet.dto.request.CreatePostRequest;
import com.socialnet.dto.response.PostResponse;
import com.socialnet.entity.*;
import com.socialnet.exception.BadRequestException;
import com.socialnet.exception.ForbiddenException;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.LikeRepository;
import com.socialnet.repository.PostRepository;
import com.socialnet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class PostService {

    private final PostRepository      postRepository;
    private final UserRepository      userRepository;
    private final LikeRepository      likeRepository;
    private final FileStorageService  fileStorageService;
    private final AiService           aiService;
    private final NotificationService notificationService;

    @Transactional
    public PostResponse createPost(CreatePostRequest req, List<MultipartFile> files, String username) {
        User user = getUser(username);
        List<String> mediaUrls = new ArrayList<>();
        if (files != null) files.forEach(f -> mediaUrls.add(fileStorageService.uploadPostMedia(f)));
        Post post = Post.builder().user(user).content(req.getContent())
                .mediaUrls(toJson(mediaUrls))
                .type(req.getType() != null ? Post.PostType.valueOf(req.getType()) : Post.PostType.POST)
                .visibility(req.getVisibility() != null ? Post.Visibility.valueOf(req.getVisibility()) : Post.Visibility.PUBLIC)
                .build();
        post = postRepository.save(post);
        return mapToResponse(post, false);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(String username, Pageable pageable) {
        User user = getUser(username);
        return postRepository.findFeedPosts(user.getId(), pageable)
                .map(p -> mapToResponse(p, likeRepository.existsByUserAndPost(user, p)));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getUserPosts(String username, Pageable pageable) {
        User author = getUser(username);
        return postRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(author, pageable)
                .map(p -> mapToResponse(p, false));
    }

    @Transactional
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new NotFoundException("Post not found"));
        postRepository.incrementViews(id);
        return mapToResponse(post, false);
    }

    @Transactional
    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id).orElseThrow(() -> new NotFoundException("Post not found"));
        User user = getUser(username);
        if (!post.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN)
            throw new ForbiddenException("Cannot delete another user's post");
        post.setIsDeleted(true);
        postRepository.save(post);
    }

    @Transactional
    public void toggleLike(Long postId, String username) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found"));
        User user = getUser(username);
        if (likeRepository.existsByUserAndPost(user, post)) {
            likeRepository.deleteByUserAndPost(user, post);
            postRepository.decrementLikes(postId);
        } else {
            likeRepository.save(Like.builder().user(user).post(post).build());
            postRepository.incrementLikes(postId);
            if (!post.getUser().getId().equals(user.getId()))
                notificationService.notify(post.getUser(), user, Notification.NotifType.LIKE, "POST", postId);
        }
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByHashtag(String tag, Pageable pageable) {
        return postRepository.findByHashtag(tag.toLowerCase(), pageable).map(p -> mapToResponse(p, false));
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found"));
    }

    private String toJson(List<String> list) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(list);
        } catch (Exception e) { return "[]"; }
    }

    public PostResponse mapToResponse(Post post, boolean isLiked) {
        return PostResponse.builder()
                .id(post.getId()).userId(post.getUser().getId())
                .username(post.getUser().getUsername()).fullName(post.getUser().getFullName())
                .avatarUrl(post.getUser().getAvatarUrl()).content(post.getContent())
                .type(post.getType().name()).visibility(post.getVisibility().name())
                .likesCount(post.getLikesCount()).commentsCount(post.getCommentsCount())
                .sharesCount(post.getSharesCount()).viewsCount(post.getViewsCount())
                .isLiked(isLiked).createdAt(post.getCreatedAt()).build();
    }
}
