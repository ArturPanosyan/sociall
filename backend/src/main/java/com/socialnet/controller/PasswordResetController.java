package com.socialnet.controller;

import com.socialnet.service.PasswordResetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService resetService;

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotRequest req) {
        resetService.requestReset(req.email());
        return ResponseEntity.ok(new MessageResponse(
            "If this email exists, a reset link has been sent."));
    }

    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetRequest req) {
        resetService.resetPassword(req.token(), req.newPassword());
        return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
    }

    // GET /api/auth/verify-email?token=xxx
    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        resetService.verifyEmail(token);
        return ResponseEntity.ok(new MessageResponse("Email verified successfully!"));
    }

    // POST /api/auth/resend-verification
    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resend(
            @Valid @RequestBody EmailRequest req) {
        resetService.resendVerification(req.email());
        return ResponseEntity.ok(new MessageResponse("Verification email sent."));
    }

    record ForgotRequest(@Email @NotBlank String email) {}
    record ResetRequest(
            @NotBlank String token,
            @NotBlank @Size(min = 8) String newPassword) {}
    record EmailRequest(@Email @NotBlank String email) {}
    record MessageResponse(String message) {}
}
