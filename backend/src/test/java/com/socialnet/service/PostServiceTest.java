package com.socialnet.service;

import com.socialnet.dto.request.CreatePostRequest;
import com.socialnet.dto.response.PostResponse;
import com.socialnet.entity.Post;
import com.socialnet.entity.User;
import com.socialnet.exception.ForbiddenException;
import com.socialnet.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostService Tests")
class PostServiceTest {

    @Mock PostRepository     postRepo;
    @Mock UserRepository     userRepo;
    @Mock LikeRepository     likeRepo;
    @Mock FileStorageService fileStorage;
    @Mock AiService          aiService;
    @Mock NotificationService notifService;
    @Mock com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @InjectMocks PostService postService;

    private User testUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L).username("alice").role(User.Role.USER)
                .status(User.UserStatus.ACTIVE).build();

        testPost = Post.builder()
                .id(1L).user(testUser)
                .content("Hello World")
                .type(Post.PostType.POST)
                .visibility(Post.Visibility.PUBLIC)
                .likesCount(0).commentsCount(0).viewsCount(0)
                .isDeleted(false).build();
    }

    @Test
    @DisplayName("Delete post - owner can delete")
    void deletePost_ownerCanDelete() {
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(testUser));

        assertThatNoException().isThrownBy(() -> postService.deletePost(1L, "alice"));
        verify(postRepo).save(argThat(p -> Boolean.TRUE.equals(p.getIsDeleted())));
    }

    @Test
    @DisplayName("Delete post - non-owner gets Forbidden")
    void deletePost_nonOwner_throwsForbidden() {
        User other = User.builder()
                .id(2L).username("bob").role(User.Role.USER).build();
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(userRepo.findByUsername("bob")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> postService.deletePost(1L, "bob"))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("Delete post - admin can delete any post")
    void deletePost_adminCanDeleteAny() {
        User admin = User.builder()
                .id(99L).username("admin").role(User.Role.ADMIN).build();
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(userRepo.findByUsername("admin")).thenReturn(Optional.of(admin));

        assertThatNoException().isThrownBy(() -> postService.deletePost(1L, "admin"));
    }

    @Test
    @DisplayName("Toggle like - adds like when not liked")
    void toggleLike_addsLike() {
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(testUser));
        when(likeRepo.existsByUserAndPost(any(), any())).thenReturn(false);

        postService.toggleLike(1L, "alice");

        verify(likeRepo).save(any());
        verify(postRepo).incrementLikes(1L);
    }

    @Test
    @DisplayName("Toggle like - removes like when already liked")
    void toggleLike_removesLike() {
        when(postRepo.findById(1L)).thenReturn(Optional.of(testPost));
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(testUser));
        when(likeRepo.existsByUserAndPost(any(), any())).thenReturn(true);

        postService.toggleLike(1L, "alice");

        verify(likeRepo).deleteByUserAndPost(any(), any());
        verify(postRepo).decrementLikes(1L);
    }

    @Test
    @DisplayName("Get feed - returns paginated posts")
    void getFeed_returnsPaginatedPosts() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Post> page   = new PageImpl<>(java.util.List.of(testPost));
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(testUser));
        when(postRepo.findFeedPosts(1L, pageable)).thenReturn(page);
        when(likeRepo.existsByUserAndPost(any(), any())).thenReturn(false);

        Page<PostResponse> result = postService.getFeed("alice", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getContent()).isEqualTo("Hello World");
    }
}
