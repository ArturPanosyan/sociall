package com.socialnet.controller;

import com.socialnet.dto.response.UserResponse;
import com.socialnet.service.UserService;
import com.socialnet.service.UserService.UpdateProfileRequest; // ✅ ВАЖНО
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ─── Профиль по username ──────────────────────────────────
    @GetMapping("/{username}/profile")
    public ResponseEntity<UserResponse> getProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getProfile(username));
    }

    // ─── Мой профиль ─────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(userService.getProfile(user.getUsername()));
    }

    // ─── Обновить профиль ─────────────────────────────────────
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(userService.updateProfile(request, user.getUsername()));
    }

    // ─── Загрузить аватар ─────────────────────────────────────
    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(userService.uploadAvatar(file, user.getUsername()));
    }

    // ─── Подписаться / Отписаться ─────────────────────────────
    @PostMapping("/{username}/follow")
    public ResponseEntity<Void> toggleFollow(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails user) {
        userService.toggleFollow(username, user.getUsername());
        return ResponseEntity.ok().build();
    }

    // ─── Список подписчиков ───────────────────────────────────
    @GetMapping("/{username}/followers")
    public ResponseEntity<Page<UserResponse>> getFollowers(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowers(username, pageable));
    }

    // ─── Список подписок ──────────────────────────────────────
    @GetMapping("/{username}/following")
    public ResponseEntity<Page<UserResponse>> getFollowing(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowing(username, pageable));
    }

    // ─── Поиск пользователей ─────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> search(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(q, pageable));
    }

}