package com.socialnet.service;

import com.socialnet.dto.response.UserResponse;
import com.socialnet.entity.Follow;
import com.socialnet.entity.Notification;
import com.socialnet.entity.User;
import com.socialnet.exception.BadRequestException;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.FollowRepository;
import com.socialnet.repository.PostRepository;
import com.socialnet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

@Service @RequiredArgsConstructor @Slf4j
public class UserService {

    private final UserRepository      userRepository;
    private final FollowRepository    followRepository;
    private final PostRepository      postRepository;
    private final FileStorageService  fileStorageService;
    private final NotificationService notificationService;
    private final PasswordEncoder     passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getProfile(String username) {
        return mapToResponse(getUser(username));
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest req, String username) {
        User user = getUser(username);
        if (req.fullName()  != null) user.setFullName(req.fullName());
        if (req.bio()       != null) user.setBio(req.bio());
        if (req.website()   != null) user.setWebsite(req.website());
        if (req.location()  != null) user.setLocation(req.location());
        if (req.birthDate() != null) user.setBirthDate(LocalDate.parse(req.birthDate()));
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse uploadAvatar(MultipartFile file, String username) {
        if (file.isEmpty()) throw new BadRequestException("File is empty");
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) throw new BadRequestException("Only images allowed");
        User user = getUser(username);
        String key = fileStorageService.uploadAvatar(file, username);
        user.setAvatarUrl("/api/files/" + key);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void toggleFollow(String targetUsername, String followerUsername) {
        if (targetUsername.equals(followerUsername)) throw new BadRequestException("Cannot follow yourself");
        User follower = getUser(followerUsername);
        User target   = getUser(targetUsername);
        followRepository.findByFollowerAndFollowing(follower, target).ifPresentOrElse(
                follow -> followRepository.delete(follow),
                () -> {
                    Follow.FollowStatus status = target.getIsPrivate()
                            ? Follow.FollowStatus.PENDING : Follow.FollowStatus.ACCEPTED;
                    followRepository.save(Follow.builder().follower(follower).following(target).status(status).build());
                    notificationService.notify(target, follower, Notification.NotifType.FOLLOW, "USER", target.getId());
                }
        );
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getFollowers(String username, Pageable pageable) {
        return followRepository.findFollowers(getUser(username), pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getFollowing(String username, Pageable pageable) {
        return followRepository.findFollowing(getUser(username), pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String query, Pageable pageable) {
        return userRepository.findAllBySearchQuery(query, pageable).map(this::mapToResponse);
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = getUser(username);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash()))
            throw new BadRequestException("Current password is incorrect");
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));
    }

    public UserResponse mapToResponse(User user) {

        long followers = followRepository.countByFollowingAndStatus(
                user, Follow.FollowStatus.ACCEPTED);

        long following = followRepository.countByFollowerAndStatus(
                user, Follow.FollowStatus.ACCEPTED);

        long posts = postRepository.countByUserAndIsDeletedFalse(user);

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .coverUrl(user.getCoverUrl())
                .website(user.getWebsite())
                .location(user.getLocation())

                // SAFE
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .isVerified(Boolean.TRUE.equals(user.getIsVerified()))
                .isPrivate(Boolean.TRUE.equals(user.getIsPrivate()))

                // SAFE COUNTS
                .followersCount(Math.toIntExact(followers))
                .followingCount(Math.toIntExact(following))
                .postsCount(Math.toIntExact(posts))

                .createdAt(user.getCreatedAt())
                .build();
    }

    public record UpdateProfileRequest(String fullName, String bio, String website,
                                       String location, String birthDate) {}
}
