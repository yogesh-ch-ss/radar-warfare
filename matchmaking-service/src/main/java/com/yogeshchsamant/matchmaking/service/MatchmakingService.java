package com.yogeshchsamant.matchmaking.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    public void enquePlayer(Player player) throws JsonProcessingException {
        // System.out.println("Redis connection factory: " + redisTemplate.getConnectionFactory());
        redisTemplate.opsForList().rightPush("matchmaking:queue", player);
        System.out.println("Player enqueued: " + player.getPlayerId());
        tryMatchingPlayers();
    }

    public Player dequePlayer() {
        Player dequedPlayer = (Player) redisTemplate.opsForList().leftPop("matchmaking:queue");
        System.out.println("Player dequeued: " + dequedPlayer.getPlayerId());
        return dequedPlayer;
    }

    public void tryMatchingPlayers() {
        Long queueSize = redisTemplate.opsForList().size("matchmaking:queue");
        System.out.println("Queue size: " + queueSize);

        if (queueSize != null && queueSize >= 2) {
            Player p1 = dequePlayer();
            Player p2 = dequePlayer();
            System.out.println("Players matched: " + p1.getPlayerId() + " vs " + p2.getPlayerId());

            String sessionId = UUID.randomUUID().toString();

            p1.setSessionId(sessionId);
            p2.setSessionId(sessionId);
            MatchInfo matchInfo = new MatchInfo(sessionId, p1, p2);

            ObjectMapper mapper = new ObjectMapper();
            String payload;
            try {
                payload = mapper.writeValueAsString(matchInfo);

                System.out.println("Sending match info to:");
                System.out.println("/subscribe/match/" + p1.getPlayerId());
                System.out.println("/subscribe/match/" + p2.getPlayerId());
                System.out.println("Payload: " + payload);

                // send matchInfo to p1 and p2 via /subscribe/match/.
                /*
                 * eg. player1 will subscribe to path "/subscribe/match/player1",
                 * so player1 must receive the info via "/subscribe/match/player1".
                 * thus, info is sent to "/subscribe/match/player1".
                 */
                messagingTemplate.convertAndSend("/subscribe/match/" + p1.getPlayerId(), payload);
                messagingTemplate.convertAndSend("/subscribe/match/" + p2.getPlayerId(), payload);

            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

        }
    }
}
