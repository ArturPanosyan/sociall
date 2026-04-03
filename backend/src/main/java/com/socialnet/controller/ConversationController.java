package com.socialnet.controller;

import com.socialnet.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService convService;

    // GET /api/conversations — все мои диалоги
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(convService.getMyConversations(user.getUsername()));
    }

    // POST /api/conversations/direct/{username} — открыть/создать DM
    @PostMapping("/direct/{username}")
    public ResponseEntity<Map<String, Object>> openDirect(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails me) {
        return ResponseEntity.ok(convService.getOrCreateDirect(me.getUsername(), username));
    }

    // POST /api/conversations/group — создать группу
    @PostMapping("/group")
    public ResponseEntity<?> createGroup(
            @RequestBody GroupRequest req,
            @AuthenticationPrincipal UserDetails me) {
        return ResponseEntity.ok(
            convService.createGroup(req.name(), req.members(), me.getUsername()));
    }

    // GET /api/conversations/{id}/messages
    @GetMapping("/{id}/messages")
    public ResponseEntity<Page<Map<String, Object>>> getMessages(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 30) Pageable pageable) {
        return ResponseEntity.ok(convService.getMessages(id, user.getUsername(), pageable));
    }

    record GroupRequest(String name, List<String> members) {}
}
