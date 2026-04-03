package com.socialnet.service;

import com.socialnet.entity.*;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository       convRepo;
    private final ConversationMemberRepository memberRepo;
    private final MessageRepository            msgRepo;
    private final UserRepository               userRepo;
    private final NotificationService          notifService;

    // ─── Мои диалоги ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyConversations(String username) {
        User me = getUser(username);
        List<Conversation> convs = convRepo.findByMember(me.getId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (Conversation c : convs) {
            Message last   = msgRepo.findLastMessage(c.getId()).orElse(null);
            long    unread = msgRepo.countUnread(c.getId(), me.getId());

            Map<String, Object> item = new HashMap<>();
            item.put("id",          c.getId());
            item.put("type",        c.getType().name());
            item.put("name",        resolveConvName(c, me));
            item.put("avatarUrl",   resolveConvAvatar(c, me));
            item.put("lastMessage", last != null ? last.getContent() : "");
            item.put("lastTime",    last != null ? last.getCreatedAt().toString() : "");
            item.put("unreadCount", unread);
            result.add(item);
        }
        return result;
    }

    // ─── Создать / найти Direct DM ────────────────────────────
    @Transactional
    public Map<String, Object> getOrCreateDirect(String myUsername, String targetUsername) {
        User me     = getUser(myUsername);
        User target = getUser(targetUsername);

        Optional<Conversation> existing = convRepo.findDirectBetween(me.getId(), target.getId());
        if (existing.isPresent()) {
            Map<String, Object> r = new HashMap<>();
            r.put("id", existing.get().getId());
            return r;
        }

        Conversation conv = Conversation.builder()
                .type(Conversation.ConvType.DIRECT)
                .createdBy(me)
                .build();
        conv = convRepo.save(conv);

        memberRepo.save(ConversationMember.builder().conversation(conv).user(me).build());
        memberRepo.save(ConversationMember.builder().conversation(conv).user(target).build());

        Map<String, Object> r = new HashMap<>();
        r.put("id", conv.getId());
        return r;
    }

    // ─── Создать групповой чат ────────────────────────────────
    @Transactional
    public Conversation createGroup(String name, List<String> memberUsernames,
                                    String creatorUsername) {
        User creator = getUser(creatorUsername);

        Conversation conv = Conversation.builder()
                .type(Conversation.ConvType.GROUP)
                .name(name)
                .createdBy(creator)
                .build();
        conv = convRepo.save(conv);

        memberRepo.save(ConversationMember.builder()
                .conversation(conv).user(creator)
                .role(ConversationMember.MemberRole.ADMIN).build());

        for (String uname : memberUsernames) {
            Conversation finalConv = conv;
            userRepo.findByUsername(uname).ifPresent(u ->
                memberRepo.save(ConversationMember.builder()
                        .conversation(finalConv).user(u).build())
            );
        }
        return conv;
    }

    // ─── Сообщения диалога ────────────────────────────────────
    @Transactional
    public Page<Map<String, Object>> getMessages(Long convId, String username, Pageable pageable) {
        User me = getUser(username);
        if (!memberRepo.existsByConversationIdAndUserId(convId, me.getId()))
            throw new NotFoundException("Conversation not found");

        msgRepo.markReadInConversation(convId, me.getId());

        return msgRepo.findByConversationId(convId, pageable).map(m -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id",           m.getId());
            item.put("content",      m.getContent() != null ? m.getContent() : "");
            item.put("type",         m.getType().name());
            item.put("mediaUrl",     m.getMediaUrl() != null ? m.getMediaUrl() : "");
            item.put("sender",       m.getSender().getUsername());
            item.put("senderAvatar", m.getSender().getAvatarUrl() != null ? m.getSender().getAvatarUrl() : "");
            item.put("isRead",       m.getIsRead());
            item.put("createdAt",    m.getCreatedAt().toString());
            return item;
        });
    }

    // ─── Сохранить сообщение (из WebSocket) ──────────────────
    @Transactional
    public Message saveMessage(Long convId, String senderUsername,
                               String content, String type) {
        User sender = getUser(senderUsername);
        Conversation conv = convRepo.findById(convId)
                .orElseThrow(() -> new NotFoundException("Conversation not found"));

        return msgRepo.save(Message.builder()
                .conversation(conv)
                .sender(sender)
                .content(content)
                .type(Message.MsgType.valueOf(type))
                .build());
    }

    // ─── Helpers ──────────────────────────────────────────────
    private User getUser(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));
    }

    private String resolveConvName(Conversation c, User me) {
        if (c.getType() == Conversation.ConvType.GROUP) return c.getName();
        return memberRepo.findOtherMember(c.getId(), me.getId())
                .map(u -> u.getFullName() != null ? u.getFullName() : u.getUsername())
                .orElse("Unknown");
    }

    private String resolveConvAvatar(Conversation c, User me) {
        if (c.getType() == Conversation.ConvType.GROUP) return c.getAvatarUrl();
        return memberRepo.findOtherMember(c.getId(), me.getId())
                .map(User::getAvatarUrl)
                .orElse("");
    }
}
