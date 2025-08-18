package com.yogeshchsamant.gameplay;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import com.yogeshchsamant.gameplay.model.AttackPayload;
import com.yogeshchsamant.gameplay.model.Cell;
import com.yogeshchsamant.gameplay.model.EndGamePayload;
import com.yogeshchsamant.gameplay.model.Grid;
import com.yogeshchsamant.gameplay.model.MatchInfo;
import com.yogeshchsamant.gameplay.model.MatchInfoDTO;
import com.yogeshchsamant.gameplay.model.Player;
import com.yogeshchsamant.gameplay.model.PlayerDTO;
import com.yogeshchsamant.gameplay.service.GameplayService;

@SpringBootTest
class GameplayServiceApplicationTests {

	@Mock
	private RedisTemplate<String, Object> redisTemplate;

	@Mock
	private ValueOperations<String, Object> valueOperations;

	@Mock
	private SimpMessagingTemplate messagingTemplate;

	@InjectMocks
	private GameplayService gameplayService;

	@BeforeEach
	void setUp() {
		// Mock the opsForValue() method to return your ValueOperations mock
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);

		when(valueOperations.setIfAbsent(anyString(), any(MatchInfo.class), any(Duration.class))).thenReturn(true);

		gameplayService = new GameplayService(messagingTemplate);
		// inject redisTemplate manually since it’s @Autowired and not in the
		// constructor
		ReflectionTestUtils.setField(gameplayService, "redisTemplate", redisTemplate);
	}

	@Test
	public void testGameInit() {
		MatchInfoDTO matchInfoDTO = new MatchInfoDTO();
		matchInfoDTO.setSessionID("testSession");
		matchInfoDTO.setPlayer1(new PlayerDTO("player1", "testSession"));
		matchInfoDTO.setPlayer2(new PlayerDTO("player2", "testSession"));

		// Create an ArgumentCaptor to capture the MatchInfo that is stored in Redis
		ArgumentCaptor<MatchInfo> matchInfoCaptor = ArgumentCaptor.forClass(MatchInfo.class);

		gameplayService.gameInit(matchInfoDTO);

		// Verify that redisTemplate.opsForValue().set() was called with the correct key
		// and a MatchInfo object
		verify(valueOperations).setIfAbsent(eq("game:testSession"), matchInfoCaptor.capture(), any(Duration.class));

		// Get the captured MatchInfo object
		MatchInfo stored = matchInfoCaptor.getValue();

		// assertions
		assertNotNull(stored);
		assertEquals("player1", stored.getPlayer1().getPlayerId());
		assertEquals("player2", stored.getPlayer2().getPlayerId());
		assertTrue(stored.getPlayer1().isTurn());
		assertFalse(stored.getPlayer2().isTurn());
		assertEquals(10, stored.getPlayer1().getGrid().getGrid().size());
	}

	@Test
	public void testProcessAttack_hitBase() {
		String sessionId = "testSession";

		Grid grid = new Grid();
		grid.fillCellsForTest(); // (0, 0), (4, 5) - hasBase = true

		Player attacker = new Player("attacker", sessionId, true, grid);
		Player defender = new Player("defender", sessionId, false, grid);

		MatchInfo matchInfo = new MatchInfo(sessionId, attacker, defender);

		when(redisTemplate.opsForValue().get("game:" + sessionId)).thenReturn(matchInfo);

		AttackPayload attackPayload = new AttackPayload(sessionId, attacker.getPlayerId(), 0, 0);

		ArgumentCaptor<MatchInfo> matchInfoCaptor = ArgumentCaptor.forClass(MatchInfo.class);

		gameplayService.processAttack(attackPayload);

		verify(valueOperations).set(eq("game:" + sessionId), matchInfoCaptor.capture(), any(Duration.class));
		MatchInfo capturedMatchInfo = matchInfoCaptor.getValue();

		Grid attackedGrid = capturedMatchInfo.getPlayer2().getGrid();
		Optional<Cell> attackedCell = capturedMatchInfo.getPlayer2().getGrid().getCell(0, 0);

		assertTrue(attackedCell.get().isHasBase());
		assertTrue(attackedCell.get().isHit());

		// fillCellsForTest() makes defences = 2
		assertEquals(attackedGrid.getDefences(), 1);

		assertFalse(capturedMatchInfo.getPlayer1().isTurn());
		assertTrue(capturedMatchInfo.getPlayer2().isTurn());

		verify(redisTemplate.opsForValue()).set(eq("game:" + sessionId), eq(capturedMatchInfo), any(Duration.class));

		verify(messagingTemplate).convertAndSend(eq("/subscribe/game/" + sessionId), eq(capturedMatchInfo));

	}

	@Test
	public void testProcessAttack_missBase() {
		String sessionId = "testSession";

		Grid grid = new Grid();
		grid.fillCellsForTest(); // (0, 0), (4, 5) - hasBase = true

		Player attacker = new Player("attacker", sessionId, true, grid);
		Player defender = new Player("defender", sessionId, false, grid);

		MatchInfo matchInfo = new MatchInfo(sessionId, attacker, defender);

		when(redisTemplate.opsForValue().get("game:" + sessionId)).thenReturn(matchInfo);

		AttackPayload attackPayload = new AttackPayload(sessionId, attacker.getPlayerId(), 1, 1);

		ArgumentCaptor<MatchInfo> matchInfoCaptor = ArgumentCaptor.forClass(MatchInfo.class);

		gameplayService.processAttack(attackPayload);

		verify(valueOperations).set(eq("game:" + sessionId), matchInfoCaptor.capture(), any(Duration.class));
		MatchInfo capturedMatchInfo = matchInfoCaptor.getValue();

		Grid attackedGrid = capturedMatchInfo.getPlayer2().getGrid();
		Optional<Cell> attackedCell = capturedMatchInfo.getPlayer2().getGrid().getCell(1, 1);

		assertFalse(attackedCell.get().isHasBase());
		assertTrue(attackedCell.get().isHit());

		// fillCellsForTest() makes defences = 2
		assertEquals(attackedGrid.getDefences(), 2);

		assertFalse(capturedMatchInfo.getPlayer1().isTurn());
		assertTrue(capturedMatchInfo.getPlayer2().isTurn());

		verify(redisTemplate.opsForValue()).set(eq("game:" + sessionId), eq(capturedMatchInfo), any(Duration.class));

		verify(messagingTemplate).convertAndSend(eq("/subscribe/game/" + sessionId), eq(capturedMatchInfo));
	}

	@Test
	public void testProcessAttack_cellAlreadyHit() {
		String sessionId = "testSession";

		Grid grid = new Grid();

		grid.getCell(0, 0).get().setHit(true); // set (0, 0) as already hit

		Player attacker = new Player("attacker", sessionId, true, grid);
		Player defender = new Player("defender", sessionId, false, grid);

		MatchInfo matchInfo = new MatchInfo(sessionId, attacker, defender);

		when(redisTemplate.opsForValue().get("game:" + sessionId)).thenReturn(matchInfo);

		AttackPayload attackPayload = new AttackPayload(sessionId, attacker.getPlayerId(), 0, 0);

		ArgumentCaptor<MatchInfo> matchInfoCaptor = ArgumentCaptor.forClass(MatchInfo.class);

		gameplayService.processAttack(attackPayload);

		verify(valueOperations).set(eq("game:" + sessionId), matchInfoCaptor.capture(), any(Duration.class));
		MatchInfo capturedMatchInfo = matchInfoCaptor.getValue();

		// Grid attackedGrid = capturedMatchInfo.getPlayer2().getGrid();
		Optional<Cell> attackedCell = capturedMatchInfo.getPlayer2().getGrid().getCell(0, 0);

		assertFalse(attackedCell.get().isHasBase());
		assertTrue(attackedCell.get().isHit());

		// Turn does not change
		assertTrue(capturedMatchInfo.getPlayer1().isTurn());
		assertFalse(capturedMatchInfo.getPlayer2().isTurn());

		verify(redisTemplate.opsForValue()).set(eq("game:" + sessionId), eq(capturedMatchInfo), any(Duration.class));

		verify(messagingTemplate).convertAndSend(eq("/subscribe/game/" + sessionId), eq(capturedMatchInfo));
	}

	@Test
	public void testhandleEndGame() {
		String sessionId = "testSession";

		Grid grid = new Grid();

		Player attacker = new Player("attacker", sessionId, true, grid);
		Player defender = new Player("defender", sessionId, false, grid);

		MatchInfo matchInfo = new MatchInfo(sessionId, attacker, defender);

		gameplayService.handleEndGame(matchInfo, "attacker");

		// Redis key should be deleted
		verify(redisTemplate).delete("game:" + sessionId);

		// Players should be unpaired
		assertNull(matchInfo.getPlayer1());
		assertNull(matchInfo.getPlayer2());

		// EndGamePayload should be sent
		ArgumentCaptor<EndGamePayload> captor = ArgumentCaptor.forClass(EndGamePayload.class);
		verify(messagingTemplate).convertAndSend(eq("/subscribe/game/" + sessionId + "/end"), captor.capture());

		EndGamePayload payload = captor.getValue();
		assertEquals(sessionId, payload.getSessionId());
		assertEquals("attacker", payload.getWinnerId());
	}

	@Test
	public void testProcessAttack_hitWinCondition() {
		String sessionId = "testSession";

		Grid grid = new Grid();
		grid.setDefences(1);
		grid.getCell(0, 0).get().setHasBase(true);

		Player attacker = new Player("attacker", sessionId, true, grid);
		Player defender = new Player("defender", sessionId, false, grid);

		MatchInfo matchInfo = new MatchInfo(sessionId, attacker, defender);

		when(redisTemplate.opsForValue().get("game:" + sessionId)).thenReturn(matchInfo);

		AttackPayload attackPayload = new AttackPayload(sessionId, attacker.getPlayerId(), 0, 0);

		gameplayService.processAttack(attackPayload);

		// Should delete Redis key
		verify(redisTemplate).delete("game:" + sessionId);

		// Should send EndGamePayload
		ArgumentCaptor<EndGamePayload> payloadCaptor = ArgumentCaptor.forClass(EndGamePayload.class);
		verify(messagingTemplate).convertAndSend(eq("/subscribe/game/" + sessionId + "/end"), payloadCaptor.capture());

		EndGamePayload payload = payloadCaptor.getValue();
		assertEquals(sessionId, payload.getSessionId());
		assertEquals("attacker", payload.getWinnerId());

		// Should save updated match info back to Redis (game ended)
		verify(valueOperations).set(eq("game:" + sessionId), any(), any(Duration.class));
	}
}
