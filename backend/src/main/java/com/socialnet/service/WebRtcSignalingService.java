package com.socialnet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebRTC Signaling через WebSocket/STOMP.
 * Поддерживает: предложение звонка, ответ, ICE кандидаты, завершение.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebRtcSignalingService {

    private final SimpMessagingTemplate messaging;

    // Активные звонки: callId → участники
    private final Map<String, CallSession> activeCalls = new ConcurrentHashMap<>();

    // ─── Инициировать звонок ──────────────────────────────────
    public void initiateCall(String callId, String callerUsername,
                             String targetUsername, boolean videoEnabled) {
        CallSession session = new CallSession(callId, callerUsername, targetUsername, videoEnabled);
        activeCalls.put(callId, session);

        // Отправить incoming-call целевому пользователю
        messaging.convertAndSendToUser(
            targetUsername,
            "/queue/call/incoming",
            buildMap("callId", callId, "caller", callerUsername, "videoEnabled", videoEnabled, "type", "INCOMING_CALL")
        );

        log.info("Call initiated: {} → {} ({})", callerUsername, targetUsername,
                 videoEnabled ? "video" : "audio");
    }

    // ─── Передать SDP Offer ───────────────────────────────────
    public void sendOffer(String callId, String fromUser, Object sdpOffer) {
        CallSession session = activeCalls.get(callId);
        if (session == null) return;

        String target = session.getOtherParticipant(fromUser);
        messaging.convertAndSendToUser(target, "/queue/call/offer",
            buildMap("callId", callId, "sdp", sdpOffer, "from", fromUser));
    }

    // ─── Передать SDP Answer ──────────────────────────────────
    public void sendAnswer(String callId, String fromUser, Object sdpAnswer) {
        CallSession session = activeCalls.get(callId);
        if (session == null) return;

        String target = session.getOtherParticipant(fromUser);
        messaging.convertAndSendToUser(target, "/queue/call/answer",
            buildMap("callId", callId, "sdp", sdpAnswer, "from", fromUser));
    }

    // ─── Передать ICE Candidate ───────────────────────────────
    public void sendIceCandidate(String callId, String fromUser, Object candidate) {
        CallSession session = activeCalls.get(callId);
        if (session == null) return;

        String target = session.getOtherParticipant(fromUser);
        messaging.convertAndSendToUser(target, "/queue/call/ice",
            buildMap("callId", callId, "candidate", candidate, "from", fromUser));
    }

    // ─── Завершить звонок ─────────────────────────────────────
    public void endCall(String callId, String fromUser) {
        CallSession session = activeCalls.remove(callId);
        if (session == null) return;

        String target = session.getOtherParticipant(fromUser);
        messaging.convertAndSendToUser(target, "/queue/call/end",
            buildMap("callId", callId, "type", "CALL_ENDED"));

        log.info("Call ended: {} (by {})", callId, fromUser);
    }

    // ─── Отклонить звонок ─────────────────────────────────────
    public void rejectCall(String callId, String fromUser) {
        CallSession session = activeCalls.remove(callId);
        if (session == null) return;

        String target = session.getOtherParticipant(fromUser);
        messaging.convertAndSendToUser(target, "/queue/call/rejected",
            buildMap("callId", callId, "type", "CALL_REJECTED"));
    }

    // ─── CallSession ──────────────────────────────────────────
    public static class CallSession {
        private final String  callId;
        private final String  caller;
        private final String  callee;
        private final boolean videoEnabled;

        public CallSession(String callId, String caller, String callee, boolean videoEnabled) {
            this.callId       = callId;
            this.caller       = caller;
            this.callee       = callee;
            this.videoEnabled = videoEnabled;
        }

        public String getOtherParticipant(String username) {
            return username.equals(caller) ? callee : caller;
        }
    }

    private Map<String, Object> buildMap(Object... pairs) {
        Map<String, Object> m = new java.util.HashMap<>();
        for (int i = 0; i + 1 < pairs.length; i += 2) {
            m.put((String) pairs[i], pairs[i + 1]);
        }
        return m;
    }

}