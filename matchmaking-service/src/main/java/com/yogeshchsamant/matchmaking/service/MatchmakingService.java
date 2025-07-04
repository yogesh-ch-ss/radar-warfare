package com.yogeshchsamant.matchmaking.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.yogeshchsamant.matchmaking.model.MatchInfo;
import com.yogeshchsamant.matchmaking.model.Player;

@Component
public class MatchmakingService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final SimpMessagingTemplate messagingTemplate;

    public MatchmakingService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void enquePlayer(Player player) {
        System.out.println("Redis connection factory: " + redisTemplate.getConnectionFactory());
        redisTemplate.opsForList().rightPush("matchmaking:queue", player);
        System.out.println("Player enqueued: " + player.getPlayerId());
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

            // send matchInfo to p1 and p2.
            messagingTemplate.convertAndSend("subscribe/match/" + p1.getPlayerId(), matchInfo);
            messagingTemplate.convertAndSend("subscribe/match/" + p2.getPlayerId(), matchInfo);

        }
    }
}
