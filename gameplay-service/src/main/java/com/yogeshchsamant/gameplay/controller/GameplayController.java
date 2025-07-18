package com.yogeshchsamant.gameplay.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.yogeshchsamant.gameplay.model.MatchInfoDTO;
import com.yogeshchsamant.gameplay.service.GameplayService;

@Controller
public class GameplayController {

    @Autowired
    private GameplayService gameplayService;

    @MessageMapping("/gameplay/init")
    public void handleGameInit(@Payload MatchInfoDTO matchInfoDTO) {
        // TODO need to write handle gameinit logic using GameplayService
        gameplayService.gameInit(matchInfoDTO);
    }

    @MessageMapping("/gameplay/attack")
    public void handleAttack() {
        // TODO need to write handle attack logic using GameplayService

    }

}
