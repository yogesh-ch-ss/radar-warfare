package com.yogeshchsamant.gameplay.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// This is a DTO to mirror what matchmaking-service sends as a MatchInfo
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchInfoDTO {
    private String sessionID;
    private PlayerDTO player1;
    private PlayerDTO player2;
}
