package com.yogeshchsamant.gameplay.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.yogeshchsamant.gameplay.model.AttackPayload;
import com.yogeshchsamant.gameplay.model.MatchInfoDTO;
import com.yogeshchsamant.gameplay.service.GameplayService;

@Controller
public class GameplayController {

    Logger logger = LoggerFactory.getLogger(GameplayController.class);

    @Autowired
    private GameplayService gameplayService;

    @MessageMapping("/gameplay/init")
    public void handleGameInit(@Payload MatchInfoDTO matchInfoDTO) {
        gameplayService.gameInit(matchInfoDTO);
    }

    @MessageMapping("/gameplay/attack")
    public void handleAttack(@Payload AttackPayload attackPayload) {
        try {
            gameplayService.processAttack(attackPayload);
        } catch (IllegalStateException e) {
            logger.error(e.toString());
        } catch (IllegalArgumentException e) {
            logger.error(e.toString());
        } catch (Exception e) {
            // e.printStackTrace();
            logger.error(e.toString());
            logger.error(e.getStackTrace().toString());
        }
    }

}
