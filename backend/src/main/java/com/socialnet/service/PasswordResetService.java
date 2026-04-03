package com.socialnet.service;

import com.socialnet.entity.PasswordResetToken;
import com.socialnet.entity.User;
import com.socialnet.exception.BadRequestException;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.PasswordResetTokenRepository;
import com.socialnet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository             userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService               emailService;
    private final PasswordEncoder            passwordEncoder;

    // ─── Запрос сброса пароля ─────────────────────────────────
    @Transactional
    public void requestReset(String email) {
        User user = userRepo.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new NotFoundException("No account with this email"));

        // Удалить старые токены
        tokenRepo.deleteAllByUserId(user.getId());

        // Создать новый токен
        String raw   = generateSecureToken();
        PasswordResetToken token = PasswordResetToken.builder()
                .token(raw)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        tokenRepo.save(token);

        // Отправить email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), raw);
        log.info("Password reset requested for: {}", email);
    }

    // ─── Подтверждение нового пароля ──────────────────────────
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepo.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset link"));

        if (resetToken.isExpired()) {
            throw new BadRequestException("Reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true);
        tokenRepo.save(resetToken);

        log.info("Password reset completed for: {}", user.getEmail());
    }

    // ─── Верификация email ────────────────────────────────────
    @Transactional
    public void verifyEmail(String token) {
        // В простой версии токен = username:timestamp в Redis
        // Здесь упрощённый вариант через тот же механизм
        PasswordResetToken verifyToken = tokenRepo.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification link"));

        if (verifyToken.isExpired()) {
            throw new BadRequestException("Verification link has expired.");
        }

        User user = verifyToken.getUser();
        user.setIsVerified(true);
        userRepo.save(user);

        verifyToken.setUsed(true);
        tokenRepo.save(verifyToken);

        log.info("Email verified for: {}", user.getEmail());
    }

    // ─── Повторная отправка верификации ───────────────────────
    @Transactional
    public void resendVerification(String email) {
        User user = userRepo.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        tokenRepo.deleteAllByUserId(user.getId());

        String raw = generateSecureToken();
        tokenRepo.save(PasswordResetToken.builder()
                .token(raw)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build());

        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), raw);
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
