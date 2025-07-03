package com.yogeshchsamant.matchmaking.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.yogeshchsamant.matchmaking.model.MatchInfo;
import com.yogeshchsamant.matchmaking.model.Player;

@Component
public class MatchmakingService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void enquePlayer(Player player) {
        redisTemplate.opsForList().rightPush("matchmaking:queue", player);
        tryMatchingPlayers();
    }

    public Player dequePlayer() {
        Player dequedPlayer = (Player) redisTemplate.opsForList().leftPop("matchmaking:queue");
        return dequedPlayer;
    }

    public void tryMatchingPlayers() {
        Long queueSize = redisTemplate.opsForList().size("matchmaking:queue");

        if (queueSize != null && queueSize >= 2) {
            Player p1 = dequePlayer();
            Player p2 = dequePlayer();

            String sessionId = UUID.randomUUID().toString();

            MatchInfo matchInfo = new MatchInfo(sessionId, p1, p2);

            messagingTemplate.convertAndSend("subscribe/match/" + p1.getPlayerId(), matchInfo);

        }
    }
}
