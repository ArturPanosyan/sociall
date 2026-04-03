package com.socialnet.controller;

import com.socialnet.dto.response.UserResponse;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.PostRepository;
import com.socialnet.repository.UserRepository;
import com.socialnet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final UserService    userService;

    // ─── Статистика ───────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("totalUsers",   userRepo.count());
        stats.put("activeUsers",  userRepo.countByStatus(User.UserStatus.ACTIVE));
        stats.put("bannedUsers",  userRepo.countByStatus(User.UserStatus.BANNED));
        stats.put("totalPosts",   postRepo.count());
        stats.put("deletedPosts", postRepo.countByIsDeletedTrue());
        return ResponseEntity.ok(stats);
    }

    // ─── Список пользователей ─────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users = (search != null && !search.isBlank())
                ? userRepo.findAllBySearchQuery(search, pageable)
                : userRepo.findAll(pageable);
        return ResponseEntity.ok(users.map(userService::mapToResponse));
    }

    // ─── Бан ──────────────────────────────────────────────────
    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<UserResponse> banUser(@PathVariable Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setStatus(User.UserStatus.BANNED);
        return ResponseEntity.ok(userService.mapToResponse(userRepo.save(user)));
    }

    // ─── Разбан ───────────────────────────────────────────────
    @PatchMapping("/users/{id}/unban")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setStatus(User.UserStatus.ACTIVE);
        return ResponseEntity.ok(userService.mapToResponse(userRepo.save(user)));
    }

    // ─── Верификация ──────────────────────────────────────────
    @PatchMapping("/users/{id}/verify")
    public ResponseEntity<UserResponse> verifyUser(@PathVariable Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setIsVerified(true);
        return ResponseEntity.ok(userService.mapToResponse(userRepo.save(user)));
    }

    // ─── Роль ─────────────────────────────────────────────────
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> setRole(
            @PathVariable Long id,
            @RequestBody RoleRequest req) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setRole(User.Role.valueOf(req.role()));
        return ResponseEntity.ok(userService.mapToResponse(userRepo.save(user)));
    }

    // ─── Удалить пост ─────────────────────────────────────────
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postRepo.findById(id).ifPresent(p -> {
            p.setIsDeleted(true);
            postRepo.save(p);
        });
        return ResponseEntity.noContent().build();
    }

    record RoleRequest(String role) {}
}
