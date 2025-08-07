package com.yogeshchsamant.gameplay.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HeartbeatResponse {
    private String status; // "session_active", "opponent_disconnected", "session_expired"
    private String sessionId;
    private long timestamp;
}
