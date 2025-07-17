package com.yogeshchsamant.gameplay.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GameplayController {

    @MessageMapping("/gameplay/attack")
    public void handleAttack() {
        // TODO need to write handleA attack logic using GameplayService

    }

}
