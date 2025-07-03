package com.yogeshchsamant.matchmaking.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.yogeshchsamant.matchmaking.model.Player;

@Component
public class MatchmakingService {

    private RedisTemplate<String, Object> redisTemplate;

    public void enquePlayer(Player player) {
        redisTemplate.opsForList().rightPush("matchmaking:queue", player);
    }

    public Player dequePlayer() {
        Player dequedPlayer = (Player) redisTemplate.opsForList().leftPop("matchmaking:queue");
        return dequedPlayer;
    }
}
