package com.yogeshchsamant.matchmaking;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yogeshchsamant.matchmaking.model.Player;
import com.yogeshchsamant.matchmaking.service.MatchmakingService;

@SpringBootTest
class MatchmakingServiceApplicationTests {

	@Mock
	private RedisTemplate<String, Object> redisTemplate;

	@Mock
	private ListOperations<String, Object> listOperations;

	@Mock
	private SimpMessagingTemplate messagingTemplate;

	@InjectMocks
	private MatchmakingService matchmakingService;

	@BeforeEach
	public void setUp() {
		MockitoAnnotations.openMocks(this);
		when(redisTemplate.opsForList()).thenReturn(listOperations);

		// manually inject the mock into the service
		matchmakingService = new MatchmakingService(messagingTemplate);
		// also manually inject redisTemplate (since it's field-injected)
		ReflectionTestUtils.setField(matchmakingService, "redisTemplate", redisTemplate);

	}

	@Test
	public void testEnquePlayer() {
		Player player = new Player();
		player.setPlayerId("player1");

		try {
			matchmakingService.enquePlayer(player);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}

		verify(listOperations).rightPush("matchmaking:queue", player);

	}

	@Test
	public void testTryMatchingPlayers() {
		Player player1 = new Player();
		player1.setPlayerId("player1");
		Player player2 = new Player();
		player2.setPlayerId("player2");

		// Mock the RedisTemplate behavior:
		// When redisTemplate.opsForList().size("matchmaking:queue") is called,
		// return 2 (Long), simulating that two players are in the queue.
		when(redisTemplate.opsForList().size("matchmaking:queue")).thenReturn((long) 2);

		// Mock the listOperations.leftPop() to return player1 on the first call and
		// player2 on the second.
		// This simulates dequeuing two players from the queue.
		when(listOperations.leftPop("matchmaking:queue")).thenReturn(player1).thenReturn(player2);


		// testing tryMatchingPlayers() logic, and assuming Redis behaves as mocked above...
		matchmakingService.tryMatchingPlayers();

		verify(messagingTemplate, times(2)).convertAndSend(startsWith("/subscribe/match/"), anyString());
	}

	@Test
	public void testTryMatchingPlayers_onePlayer(){

		when(redisTemplate.opsForList().size("matchmaking:queue")).thenReturn((long) 1);

		matchmakingService.tryMatchingPlayers();

		verify(messagingTemplate, never()).convertAndSend(anyString(), anyString());

	}
}
