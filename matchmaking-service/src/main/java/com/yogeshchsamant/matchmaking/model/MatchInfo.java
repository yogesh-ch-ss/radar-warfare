package com.yogeshchsamant.matchmaking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchInfo {
    private String sessionID;
    private Player player1;
    private Player player2;

}
