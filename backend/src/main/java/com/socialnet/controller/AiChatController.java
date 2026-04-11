package com.socialnet.controller;

import com.socialnet.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest req) {
        String prompt = "You are a helpful assistant for SocialNet social platform. " +
                "Be concise, friendly and helpful. User says: " + req.message();
        String reply = aiService.generateText(prompt);
        Map<String, String> r = new HashMap<>();
        r.put("reply", reply != null ? reply : "Sorry, AI is not available right now. Please configure OPENAI_API_KEY.");
        return ResponseEntity.ok(r);
    }

    @PostMapping("/suggest-post")
    public ResponseEntity<Map<String, String>> suggestPost(@RequestBody Map<String, String> req) {
        String topic = req.getOrDefault("topic", "general");
        String prompt = "Write a short engaging social media post (2-3 sentences) about: " + topic +
                ". Be creative and use relevant emoji. Don't use hashtags.";
        String suggestion = aiService.generateText(prompt);
        Map<String, String> r = new HashMap<>();
        r.put("suggestion", suggestion != null ? suggestion : "");
        return ResponseEntity.ok(r);
    }

    record ChatRequest(String message) {}
}
