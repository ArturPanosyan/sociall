package com.socialnet.service;

import com.socialnet.entity.Notification;
import com.socialnet.entity.User;
import com.socialnet.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final SimpMessagingTemplate  messagingTemplate;

    // ─── Создать и отправить уведомление ─────────────────────
    @Transactional
    public void notify(User recipient, User sender,
                       Notification.NotifType type,
                       String entityType, Long entityId) {
        Notification notif = Notification.builder()
                .user(recipient)
                .sender(sender)
                .type(type)
                .entityType(entityType)
                .entityId(entityId)
                .message(buildMessage(sender, type))
                .build();

        notif = notifRepo.save(notif);

        // Push через WebSocket в реальном времени
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                notif
        );

        log.info("Notification sent to {} type={}", recipient.getUsername(), type);
    }

    // ─── Получить уведомления пользователя ───────────────────
    @Transactional(readOnly = true)
    public Page<Notification> getNotifications(String username, Pageable pageable) {
        return notifRepo.findByUserUsernameOrderByCreatedAtDesc(username, pageable);
    }

    // ─── Отметить как прочитанные ─────────────────────────────
    @Transactional
    public void markAllRead(String username) {
        notifRepo.markAllReadByUsername(username);
    }

    // ─── Счётчик непрочитанных ────────────────────────────────
    public long countUnread(String username) {
        return notifRepo.countByUserUsernameAndIsReadFalse(username);
    }

    private String buildMessage(User sender, Notification.NotifType type) {
        String name = sender.getFullName() != null ? sender.getFullName() : sender.getUsername();
        return switch (type) {
            case LIKE    -> name + " liked your post";
            case COMMENT -> name + " commented on your post";
            case FOLLOW  -> name + " started following you";
            case MENTION -> name + " mentioned you";
            case MESSAGE -> name + " sent you a message";
            case SYSTEM  -> "System notification";
        };
    }
}
