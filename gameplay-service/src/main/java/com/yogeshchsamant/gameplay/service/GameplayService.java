package com.yogeshchsamant.gameplay.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class GameplayService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final SimpMessagingTemplate messagingTemplate;

    public GameplayService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void gameInit(){
        // TODO write game init logic for player 1 and player 2 by assigning grid and grid units
    }

    public void processAttack(){
        // TODO write attack logic
    }

}
