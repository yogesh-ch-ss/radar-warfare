package com.yogeshchsamant.gameplay.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// This is a DTO to mirror what matchmaking-service sends as a Player
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDTO {
    private String playerId;
    private String sessionId;
}
