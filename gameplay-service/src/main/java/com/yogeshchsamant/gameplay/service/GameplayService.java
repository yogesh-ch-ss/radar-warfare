package com.yogeshchsamant.gameplay.service;

import java.time.Duration;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.yogeshchsamant.gameplay.model.AttackPayload;
import com.yogeshchsamant.gameplay.model.Cell;
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
        redisTemplate.opsForValue().set("game:" + sessionId, matchInfo, Duration.ofMinutes(1));
    }

    public void processAttack(AttackPayload attackPayload) {

        // extract MatchInfo from attackPayload's sessionId
        MatchInfo matchInfo = (MatchInfo) redisTemplate.opsForValue().get("game:" + attackPayload.getSessionId());

        Player attacker = new Player();
        Player defender = new Player();

        // set attacker and defender
        if (matchInfo.getPlayer1().isTurn()) {
            attacker = matchInfo.getPlayer1();
            defender = matchInfo.getPlayer2();
        } else if (matchInfo.getPlayer2().isTurn()) {
            attacker = matchInfo.getPlayer2();
            defender = matchInfo.getPlayer1();
        } else {
            System.err.println("attacker and defender cannot be defined!");
        }

        // --- perform attack ---

        /*
         * get defender's grid's cell
         * cell's isHit = true
         * check if cell has base
         * if base, grid's defences -= 1; else, continue
         * CHECK WIN CONDITION
         * switch isTurn for plater1 and player2
         * save new update to redis
         * notify both players
         */

        Optional<Cell> cell = defender.getGrid().getCell(attackPayload.getX(), attackPayload.getY());

        cell.get().setHit(true);

        if (cell.get().isHasBase()) {
            defender.getGrid().defenceAttacked(); // reduces grid's defence by 1
        }

        // check win condition
        if (defender.didPlayerLose()) {
            System.out.println(attacker.getPlayerId() + " WON!!!");

            // TODO handle endgame logic

            // return;
        }

        // switch turns
        attacker.setTurn(false);
        defender.setTurn(true);

        /*
         * java objects are passed by reference.
         * that ensures that whatever changes we have made so far in the class
         * attributes of matchInfo > player > grid > cell will reflect on matchInfo.
         * therefore the same matchInfo object will have the updaes in it.
         */

        // save updates to redis
        redisTemplate.opsForValue().set("game:" + attackPayload.getSessionId(), matchInfo, Duration.ofMinutes(1));

        // notify both players (via STOMP)
        messagingTemplate.convertAndSend("/subscribe/game/" + attackPayload.getSessionId(), matchInfo);
    }

}
