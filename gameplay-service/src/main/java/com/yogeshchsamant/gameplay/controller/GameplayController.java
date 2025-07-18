package com.yogeshchsamant.gameplay.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GameplayController {

    @MessageMapping("/gameplay/init")
    public void handleGameInit() {
        // TODO need to write handle gameinit logic using GameplayService

    }


    @MessageMapping("/gameplay/attack")
    public void handleAttack() {
        // TODO need to write handle attack logic using GameplayService

    }

}
