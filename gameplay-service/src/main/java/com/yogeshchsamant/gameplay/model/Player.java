package com.yogeshchsamant.gameplay.model;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Player implements Serializable {
    private static final long serialVersionUID = 1L;
    private String playerId;
    private String sessionId;
    private boolean isTurn;
    private Grid grid;

    public boolean didPlayerLose() {
        // if the player's defences are 0, the player lost
        return (this.getGrid().getDefences() <= 0) ? true : false;
    }
}
