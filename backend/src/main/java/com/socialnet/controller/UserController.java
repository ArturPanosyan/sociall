package com.socialnet.controller;

import com.socialnet.dto.response.UserResponse;
import com.socialnet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}/profile")
    public ResponseEntity<UserResponse> getProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getProfile(username));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(userService.getProfile(user.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UserService.UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(
                userService.updateProfile(request, user.getUsername())
        );
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @RequestBody Map<String, String> updates,
            @AuthenticationPrincipal UserDetails user) {

        var req = new UserService.UpdateProfileRequest(
                updates.get("fullName"),
                updates.get("bio"),
                updates.get("website"),
                updates.get("location"),
                updates.get("birthDate")
        );

        return ResponseEntity.ok(
                userService.updateProfile(req, user.getUsername())
        );
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(
                userService.uploadAvatar(file, user.getUsername())
        );
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Void> toggleFollow(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails user) {

        userService.toggleFollow(username, user.getUsername());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<Page<UserResponse>> getFollowers(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(
                userService.getFollowers(username, pageable)
        );
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<Page<UserResponse>> getFollowing(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(
                userService.getFollowing(username, pageable)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> search(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(
                userService.searchUsers(q, pageable)
        );
    }
}