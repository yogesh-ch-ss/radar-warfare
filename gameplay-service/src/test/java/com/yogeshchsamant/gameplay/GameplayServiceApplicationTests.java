package com.yogeshchsamant.gameplay;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.yogeshchsamant.gameplay.model.MatchInfo;
import com.yogeshchsamant.gameplay.model.MatchInfoDTO;
import com.yogeshchsamant.gameplay.model.PlayerDTO;
import com.yogeshchsamant.gameplay.service.GameplayService;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class GameplayServiceApplicationTests {

	@Mock
	private RedisTemplate<String, Object> redisTemplate;

	@Mock
	private ValueOperations<String, Object> valueOperations;

	@InjectMocks
	private GameplayService gameplayService;

	@BeforeEach
	void setUp() {
		// Mock the opsForValue() method to return your ValueOperations mock
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
	}

	@Test
	public void testGameInit() {
		MatchInfoDTO matchInfoDTO = new MatchInfoDTO();
		matchInfoDTO.setSessionID("testSession");
		matchInfoDTO.setPlayer1(new PlayerDTO("player1", "testSession"));
		matchInfoDTO.setPlayer2(new PlayerDTO("player2", "testSession"));

		// Create an ArgumentCaptor to capture the MatchInfo that is stored in Redis
		ArgumentCaptor<MatchInfo> matchInfoCaptor = ArgumentCaptor.forClass(MatchInfo.class);

		MatchInfo expectedMatchInfo = new MatchInfo();

		gameplayService.gameInit(matchInfoDTO);

		// Verify that redisTemplate.opsForValue().set() was called with the correct key
		// and a MatchInfo object
		verify(valueOperations).set(eq("game:testSession"), matchInfoCaptor.capture());

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

}
