package com.yogeshchsamant.gameplay.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EndGamePayload {
    private String sessionId;
    private String winnerId;
}
