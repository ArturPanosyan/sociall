package com.socialnet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${openai.api-key}") private String apiKey;
    @Value("${openai.model}")   private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    // ─── Автомодерация контента ───────────────────────────────
    public boolean isContentSafe(String text) {
        String prompt = """
            Analyze the following text for harmful content (hate speech, violence, spam, adult).
            Reply ONLY with JSON: {"safe": true/false, "reason": "..."}
            Text: "%s"
            """.formatted(text);

        String response = callOpenAI(prompt);
        return response != null && response.contains("\"safe\": true");
    }

    // ─── Генерация описания профиля ───────────────────────────
    public String generateBio(String username, List<String> interests) {
        String prompt = """
            Write a short, friendly social media bio (max 150 chars) for user "%s"
            with interests: %s. Make it catchy and authentic.
            """.formatted(username, String.join(", ", interests));
        return callOpenAI(prompt);
    }

    // ─── AI-ассистент в чате ──────────────────────────────────
    public String chatAssistant(String userMessage, List<String> history) {
        String historyText = String.join("\n", history);
        String prompt = """
            You are a helpful assistant in a social network chat.
            Recent conversation: %s
            User says: %s
            Reply briefly and helpfully.
            """.formatted(historyText, userMessage);
        return callOpenAI(prompt);
    }

    // ─── Перевод сообщения ────────────────────────────────────
    public String translateMessage(String text, String targetLang) {
        String prompt = "Translate to %s. Reply ONLY with translation: %s"
                .formatted(targetLang, text);
        return callOpenAI(prompt);
    }

    // ─── Умный поиск хэштегов ─────────────────────────────────
    public List<String> suggestHashtags(String postContent) {
        String prompt = """
            Suggest 5 relevant hashtags for this post (without #, comma-separated):
            "%s"
            """.formatted(postContent);
        String result = callOpenAI(prompt);
        if (result == null) return List.of();
        return List.of(result.split(",\\s*"));
    }

    // ─── Внутренний вызов OpenAI ──────────────────────────────
    private String callOpenAI(String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> msgMap = new java.util.HashMap<>();
            msgMap.put("role", "user");
            msgMap.put("content", userPrompt);

            Map<String, Object> body = new java.util.HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(msgMap));
            body.put("max_tokens", 500);

            ResponseEntity<Map> response = restTemplate.exchange(
                    OPENAI_URL, HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);

            if (response.getBody() != null) {
                List choices = (List) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map message = (Map) choice.get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            log.error("OpenAI call failed: {}", e.getMessage());
        }
        return null;
    }

    public String generateText(String prompt) {
        return callOpenAI(prompt);
    }

}