package com.socialnet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost}")
    private String baseUrl;

    // ─── Email верификация ────────────────────────────────────
    @Async
    public void sendVerificationEmail(String toEmail, String username, String token) {
        String link = baseUrl + "/verify-email?token=" + token;
        String html = """
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px">
              <div style="background:#4f46e5;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
                <h1 style="color:white;margin:0;font-size:24px">SocialNet</h1>
              </div>
              <h2 style="color:#111827">Verify your email</h2>
              <p style="color:#6b7280">Hi <strong>%s</strong>, confirm your email address:</p>
              <a href="%s" style="display:inline-block;background:#4f46e5;color:white;
                 padding:14px 32px;border-radius:12px;text-decoration:none;
                 font-weight:600;margin:16px 0">
                Verify Email
              </a>
              <p style="color:#9ca3af;font-size:13px">Link expires in 24 hours.<br>
                If you didn't create an account, ignore this email.</p>
            </div>
            """.formatted(username, link);

        sendHtml(toEmail, "Verify your SocialNet email", html);
    }

    // ─── Сброс пароля ─────────────────────────────────────────
    @Async
    public void sendPasswordResetEmail(String toEmail, String username, String token) {
        String link = baseUrl + "/reset-password?token=" + token;
        String html = """
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px">
              <div style="background:#4f46e5;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
                <h1 style="color:white;margin:0;font-size:24px">SocialNet</h1>
              </div>
              <h2 style="color:#111827">Reset your password</h2>
              <p style="color:#6b7280">Hi <strong>%s</strong>, we received a password reset request:</p>
              <a href="%s" style="display:inline-block;background:#ef4444;color:white;
                 padding:14px 32px;border-radius:12px;text-decoration:none;
                 font-weight:600;margin:16px 0">
                Reset Password
              </a>
              <p style="color:#9ca3af;font-size:13px">Link expires in 1 hour.<br>
                If you didn't request this, ignore this email.</p>
            </div>
            """.formatted(username, link);

        sendHtml(toEmail, "Reset your SocialNet password", html);
    }

    // ─── Уведомление о новом подписчике ──────────────────────
    @Async
    public void sendFollowNotification(String toEmail, String followerName) {
        String html = """
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px">
              <p style="color:#374151;font-size:16px">
                <strong>%s</strong> started following you on SocialNet! 🎉
              </p>
              <a href="%s/feed" style="display:inline-block;background:#4f46e5;color:white;
                 padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600">
                View Profile
              </a>
            </div>
            """.formatted(followerName, baseUrl);

        sendHtml(toEmail, followerName + " followed you on SocialNet", html);
    }

    // ─── Внутренний метод отправки ────────────────────────────
    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail, "SocialNet");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
