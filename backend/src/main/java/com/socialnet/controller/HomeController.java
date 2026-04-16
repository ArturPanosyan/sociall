package com.socialnet.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("app",       "SocialNet API");
        info.put("version",   "1.0.0");
        info.put("status",    "✅ Backend is running!");
        info.put("time",      LocalDateTime.now().toString());
        info.put("docs",      "Use /api-test in the frontend app for API testing");
        info.put("health",    "http://localhost:8080/actuator/health");
        info.put("endpoints", Map.of(
            "auth",          "/api/auth/**",
            "posts",         "/api/posts/**",
            "users",         "/api/users/**",
            "messages",      "/api/conversations/**",
            "notifications", "/api/notifications/**",
            "analytics",     "/api/analytics/**",
            "ai",            "/api/ai/**",
            "polls",         "/api/polls/**"
        ));
        return info;
    }
}
