package com.socialnet.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Push уведомления через Web Push API.
 * Хранит подписки в памяти (в продакшене — в БД).
 * Для отправки push использовать библиотеку: nl.martijndwars:web-push
 */
@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
@Slf4j
public class PushController {

    // username → subscription JSON
    private static final Map<String, Object> subscriptions = new ConcurrentHashMap<>();

    // POST /api/push/subscribe
    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(
            @RequestBody Map<String, Object> subscription,
            @AuthenticationPrincipal UserDetails user) {
        subscriptions.put(user.getUsername(), subscription);
        log.info("Push subscription saved for: {}", user.getUsername());
        return ResponseEntity.ok().build();
    }

    // DELETE /api/push/unsubscribe
    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(@AuthenticationPrincipal UserDetails user) {
        subscriptions.remove(user.getUsername());
        return ResponseEntity.noContent().build();
    }

    // Вспомогательный метод для отправки push из других сервисов
    public static boolean hasSubscription(String username) {
        return subscriptions.containsKey(username);
    }

    public static Object getSubscription(String username) {
        return subscriptions.get(username);
    }
}
