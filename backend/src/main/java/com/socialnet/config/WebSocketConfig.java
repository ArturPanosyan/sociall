package com.socialnet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import lombok.Data;

// ─── WebSocket Config ─────────────────────────────────────────
@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}

// ─── Chat Controller ──────────────────────────────────────────
@Controller
class ChatController {

    // Личное сообщение → /app/chat.send
    @MessageMapping("/chat.send")
    @SendTo("/queue/messages")
    public ChatMessage sendMessage(@Payload ChatMessage message,
                                   SimpMessageHeaderAccessor accessor) {
        message.setSender(accessor.getUser() != null
                ? accessor.getUser().getName() : "anonymous");
        return message;
    }

    // Уведомление о наборе текста → /app/chat.typing
    @MessageMapping("/chat.typing")
    @SendTo("/topic/typing")
    public TypingEvent typing(@Payload TypingEvent event) {
        return event;
    }
}

// ─── DTO ─────────────────────────────────────────────────────
@Data
class ChatMessage {
    private Long conversationId;
    private String sender;
    private String content;
    private String type; // TEXT, IMAGE, VOICE
    private String timestamp;
}

@Data
class TypingEvent {
    private Long conversationId;
    private String username;
    private boolean typing;
}
