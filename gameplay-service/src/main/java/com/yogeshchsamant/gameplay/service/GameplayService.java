package com.yogeshchsamant.gameplay.service;

import java.time.Duration;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.yogeshchsamant.gameplay.model.AttackPayload;
import com.yogeshchsamant.gameplay.model.Cell;
import com.yogeshchsamant.gameplay.model.EndGamePayload;
import com.yogeshchsamant.gameplay.model.Grid;
import com.yogeshchsamant.gameplay.model.MatchInfo;
import com.yogeshchsamant.gameplay.model.MatchInfoDTO;
import com.yogeshchsamant.gameplay.model.Player;

@Component
public class GameplayService {

    Logger logger = LoggerFactory.getLogger(GameplayService.class);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final SimpMessagingTemplate messagingTemplate;

    public GameplayService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void gameInit(MatchInfoDTO matchinfoDTO) {

        String sessionId = matchinfoDTO.getSessionID();
        String sessionKeyForRedis = "game:" + sessionId;

        // if (redisTemplate.hasKey(sessionKeyForRedis)) {
        // // the sessionKeyForRedis already exists in redis since gameInit would have
        // been
        // // called by the other client
        // System.out.println("Game already initialized for sessionId: " + sessionId);
        // return;
        // }

        // create grid
        Grid grid1 = new Grid();
        Grid grid2 = new Grid();

        grid1.fillCells();
        grid2.fillCells();

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
        // redisTemplate.opsForValue().set(sessionKeyForRedis, matchInfo,
        // Duration.ofMinutes(2));

        Boolean sessionKeyPresentOnRedis = redisTemplate.opsForValue()
                .setIfAbsent(sessionKeyForRedis, matchInfo, Duration.ofMinutes(2));
        if (sessionKeyPresentOnRedis) {
            String message = "Game initialized successfully for sessionId: " + sessionId;
            logger.info(message);
            // Notify both players via STOMP
            messagingTemplate.convertAndSend("/subscribe/game/" + sessionId, matchInfo);
        } else {
            String message = "Game already initialized for sessionId: " + sessionId;
            logger.info(message);
        }

    }

    public void processAttack(AttackPayload attackPayload) {

        // extract MatchInfo from attackPayload's sessionId
        MatchInfo matchInfo = (MatchInfo) redisTemplate.opsForValue().get("game:" + attackPayload.getSessionId());

        if (matchInfo == null) {
            throw new IllegalStateException("Session expired or does not exist: " + attackPayload.getSessionId());
        }

        logger.info("sessionId: " + attackPayload.getSessionId() + "; attackerId: "
                + attackPayload.getAttackerId() + "; x: " + attackPayload.getX() + "; y: " + attackPayload.getY());

        Player attacker = new Player();
        Player defender = new Player();

        // set attacker and defender
        if (matchInfo.getPlayer1().isTurn()
                && attackPayload.getAttackerId().equals(matchInfo.getPlayer1().getPlayerId())) {
            attacker = matchInfo.getPlayer1();
            defender = matchInfo.getPlayer2();
        } else if (matchInfo.getPlayer2().isTurn()
                && attackPayload.getAttackerId().equals(matchInfo.getPlayer2().getPlayerId())) {
            attacker = matchInfo.getPlayer2();
            defender = matchInfo.getPlayer1();
        } else {
            logger.warn("Attacker and defender cannot be defined!");
            throw new IllegalArgumentException("Invalid attacker or not attacker's turn.");
        }

        // --- perform attack ---

        /*
         * get defender's grid's cell
         * cell's isHit = true
         * check if cell has base
         * if base, grid's defences -= 1; else, continue
         * !!! CHECK WIN CONDITION !!!
         * switch isTurn for plater1 and player2
         * save new update to redis
         * notify both players
         */

        Optional<Cell> cell = defender.getGrid().getCell(attackPayload.getX(), attackPayload.getY());

        // backend robustness:
        // if cell is already hit, the turns do not switch
        // the attacker will attack again

        boolean isCellHitAlready = cell.get().isHit();

        if (isCellHitAlready) {
            // if cell is already hit, maintain turn
            logger.warn("Cell x:" + attackPayload.getX() + "; y:" + attackPayload.getY() + " is already hit");
        } else {
            // if cell is not hit, hit, check win condition, switch turns
            cell.get().setHit(true);

            if (cell.get().isHasBase()) {
                defender.getGrid().defenceAttacked(); // reduces grid's defence by 1
            }

            // !!! CHECK WIN CONDITION !!!
            if (defender.didPlayerLose()) {
                logger.info(attacker.getPlayerId() + " WON!!!");

                // handle endgame logic - handleEndGame()
                handleEndGame(matchInfo, attacker.getPlayerId());
                return;
            }

            // switch turns
            attacker.setTurn(false);
            defender.setTurn(true);

            logger.info("Cell x:" + attackPayload.getX() + "; y:" + attackPayload.getY() + " is successfully hit");

        }

        /*
         * java objects are passed by reference.
         * that ensures that whatever changes we have made so far in the class
         * attributes of matchInfo > player > grid > cell will reflect on matchInfo.
         * therefore the same matchInfo object will have the updaes in it.
         */

        // save updates to redis
        redisTemplate.opsForValue().set("game:" + attackPayload.getSessionId(), matchInfo, Duration.ofMinutes(2));

        // notify both players (via STOMP)
        messagingTemplate.convertAndSend("/subscribe/game/" + attackPayload.getSessionId(), matchInfo);
    }

    public void handleEndGame(MatchInfo matchInfo, String winnerId) {
        /*
         * Remove key from redis.
         * Unpair players from MatchInfo.
         * Delete MatchInfo object.
         * graceful deletion and clearing any trace of the match.
         */

        String sessionId = matchInfo.getSessionID();
        String redisKey = "game:" + sessionId;

        // remove key from redis
        redisTemplate.delete(redisKey);
        logger.info("Deleted game session from redis for game:" + sessionId);

        // unpair players in matchInfo
        matchInfo.setPlayer1(null);
        matchInfo.setPlayer2(null);

        // notify clients about winner
        EndGamePayload endGamePayload = new EndGamePayload(sessionId, winnerId);
        messagingTemplate.convertAndSend("/subscribe/game/" + sessionId + "/end", endGamePayload);

    }

}
