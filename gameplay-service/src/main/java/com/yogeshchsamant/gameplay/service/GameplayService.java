package com.yogeshchsamant.gameplay.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.yogeshchsamant.gameplay.model.Grid;
import com.yogeshchsamant.gameplay.model.MatchInfo;
import com.yogeshchsamant.gameplay.model.MatchInfoDTO;
import com.yogeshchsamant.gameplay.model.Player;

@Component
public class GameplayService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final SimpMessagingTemplate messagingTemplate;

    public GameplayService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void gameInit(MatchInfoDTO matchinfoDTO) {
        // TODO write game init logic for player 1 and player 2 by assigning grid and
        // grid units

        String sessionId = matchinfoDTO.getSessionID();

        // create grid
        Grid grid1 = new Grid();
        Grid grid2 = new Grid();

        // convert DTO to gameplay model by creating the gameplay players
        Player player1 = new Player(
                matchinfoDTO.getPlayer1().getPlayerId(),
                sessionId,
                true, // player1 starts
                grid1);

        Player player2 = new Player(
                matchinfoDTO.getPlayer2().getPlayerId(),
                sessionId,
                false, // player1 starts - player 2 idle
                grid2);

        // getting the right MatchInfo for gameplay service,
        // converting it to MatchInfo for gameplay service
        MatchInfo matchInfo = new MatchInfo(sessionId, player1, player2);

        // store in redis
        // stored in redis under the namespace "game:{sessionId}:matchInfo"
        redisTemplate.opsForValue().set("game:" + sessionId, matchInfo);
    }

    public void processAttack() {
        // TODO write attack logic
    }

}
