package com.yogeshchsamant.matchmaking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yogeshchsamant.matchmaking.model.Player;
import com.yogeshchsamant.matchmaking.service.MatchmakingService;

// @RequestMapping("/matchmaking")
@Controller
public class MatchmakingController {

    @Autowired
    private MatchmakingService matchmakingService;

    @MessageMapping("matchmaking/join")
    public void handlePlayerJoin(Player player) {
        try {
            matchmakingService.enquePlayer(player);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @MessageMapping("matchmaking/leave")
    public void handlePlayerLeave(Player player) {
        try {
            matchmakingService.dequePlayerById(player.getPlayerId());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
