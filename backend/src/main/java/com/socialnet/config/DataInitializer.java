package com.socialnet.config;

import com.socialnet.entity.*;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository      userRepo;
    private final PostRepository      postRepo;
    private final PasswordEncoder     passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepo.count() > 0) {
            log.info("✅ Database already has data — skipping seed");
            return;
        }
        log.info("🌱 Seeding database with demo data...");

        // ── Пользователи ──────────────────────────────────────
        User admin = userRepo.save(User.builder()
            .username("admin")
            .email("admin@socialnet.com")
            .passwordHash(passwordEncoder.encode("Admin123!"))
            .fullName("Admin User")
            .bio("Platform administrator")
            .role(User.Role.ADMIN)
            .status(User.UserStatus.ACTIVE)
            .isVerified(true)
            .isPrivate(false)
            .build());

        User alice = userRepo.save(User.builder()
            .username("alice")
            .email("alice@example.com")
            .passwordHash(passwordEncoder.encode("Alice123!"))
            .fullName("Alice Johnson")
            .bio("Frontend developer 🚀 | Coffee addict ☕")
            .role(User.Role.USER)
            .status(User.UserStatus.ACTIVE)
            .isVerified(true)
            .isPrivate(false)
            .build());

        User bob = userRepo.save(User.builder()
            .username("bob")
            .email("bob@example.com")
            .passwordHash(passwordEncoder.encode("Bob123!"))
            .fullName("Bob Smith")
            .bio("Backend engineer | Open source enthusiast")
            .role(User.Role.USER)
            .status(User.UserStatus.ACTIVE)
            .isVerified(false)
            .isPrivate(false)
            .build());

        User demo = userRepo.save(User.builder()
            .username("demo")
            .email("demo@socialnet.com")
            .passwordHash(passwordEncoder.encode("Demo123!"))
            .fullName("Demo User")
            .bio("Just exploring SocialNet! 👋")
            .role(User.Role.USER)
            .status(User.UserStatus.ACTIVE)
            .isVerified(false)
            .isPrivate(false)
            .build());

        // ── Посты ─────────────────────────────────────────────
        postRepo.save(Post.builder()
            .user(alice)
            .content("🎉 Welcome to SocialNet! This is our brand new social platform built with Spring Boot + Angular. Excited to be here!")
            .type(Post.PostType.POST)
            .visibility(Post.Visibility.PUBLIC)
            .build());

        postRepo.save(Post.builder()
            .user(bob)
            .content("Just deployed the backend API. JWT auth, WebSocket chat, MinIO file storage — all working! 💪 #tech #springboot")
            .type(Post.PostType.POST)
            .visibility(Post.Visibility.PUBLIC)
            .build());

        postRepo.save(Post.builder()
            .user(admin)
            .content("SocialNet is live! 🚀 Create your account and start connecting with people. Features: real-time chat, posts, stories, video calls and much more!")
            .type(Post.PostType.POST)
            .visibility(Post.Visibility.PUBLIC)
            .build());

        postRepo.save(Post.builder()
            .user(alice)
            .content("Angular 17 standalone components with signals are amazing! The new control flow syntax @if, @for makes templates so much cleaner. #angular #webdev")
            .type(Post.PostType.POST)
            .visibility(Post.Visibility.PUBLIC)
            .build());

        postRepo.save(Post.builder()
            .user(demo)
            .content("Hello everyone! I'm the demo user. Feel free to explore the platform. Login with demo@socialnet.com / Demo123!")
            .type(Post.PostType.POST)
            .visibility(Post.Visibility.PUBLIC)
            .build());

        log.info("✅ Seed complete: {} users, {} posts", userRepo.count(), postRepo.count());
        log.info("📋 Demo accounts:");
        log.info("   admin@socialnet.com / Admin123!");
        log.info("   alice@example.com  / Alice123!");
        log.info("   bob@example.com    / Bob123!");
        log.info("   demo@socialnet.com / Demo123!");
    }
}
