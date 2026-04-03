package com.socialnet.controller;

import com.socialnet.service.WebRtcSignalingService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

/**
 * WebRTC сигнализация через STOMP WebSocket.
 *
 * Клиент шлёт сообщения на:
 *   /app/call.initiate   — начать звонок
 *   /app/call.offer      — отправить SDP offer
 *   /app/call.answer     — отправить SDP answer
 *   /app/call.ice        — отправить ICE candidate
 *   /app/call.end        — завершить звонок
 *   /app/call.reject     — отклонить звонок
 */
@Controller
@RequiredArgsConstructor
public class WebRtcController {

    private final WebRtcSignalingService signalingService;

    @MessageMapping("/call.initiate")
    public void initiate(@Payload Map<String, Object> payload,
                         SimpMessageHeaderAccessor accessor) {
        String caller  = getPrincipal(accessor);
        String target  = (String)  payload.get("targetUsername");
        boolean video  = Boolean.TRUE.equals(payload.get("videoEnabled"));
        String callId  = UUID.randomUUID().toString();
        signalingService.initiateCall(callId, caller, target, video);
    }

    @MessageMapping("/call.offer")
    public void offer(@Payload Map<String, Object> payload,
                      SimpMessageHeaderAccessor accessor) {
        String from   = getPrincipal(accessor);
        String callId = (String) payload.get("callId");
        signalingService.sendOffer(callId, from, payload.get("sdp"));
    }

    @MessageMapping("/call.answer")
    public void answer(@Payload Map<String, Object> payload,
                       SimpMessageHeaderAccessor accessor) {
        String from   = getPrincipal(accessor);
        String callId = (String) payload.get("callId");
        signalingService.sendAnswer(callId, from, payload.get("sdp"));
    }

    @MessageMapping("/call.ice")
    public void ice(@Payload Map<String, Object> payload,
                    SimpMessageHeaderAccessor accessor) {
        String from   = getPrincipal(accessor);
        String callId = (String) payload.get("callId");
        signalingService.sendIceCandidate(callId, from, payload.get("candidate"));
    }

    @MessageMapping("/call.end")
    public void end(@Payload Map<String, Object> payload,
                    SimpMessageHeaderAccessor accessor) {
        String from   = getPrincipal(accessor);
        String callId = (String) payload.get("callId");
        signalingService.endCall(callId, from);
    }

    @MessageMapping("/call.reject")
    public void reject(@Payload Map<String, Object> payload,
                       SimpMessageHeaderAccessor accessor) {
        String from   = getPrincipal(accessor);
        String callId = (String) payload.get("callId");
        signalingService.rejectCall(callId, from);
    }

    private String getPrincipal(SimpMessageHeaderAccessor accessor) {
        return accessor.getUser() != null ? accessor.getUser().getName() : "anonymous";
    }
}
