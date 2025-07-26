package com.yogeshchsamant.gameplay.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// @EnableWebSocketMessageBroker - enables STOMP over websocket.
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    /*
     * WebSocketMessageBrokerConfigurer - Uses STOMP protocol.
     * Good for pub-sub models, no manual management of sessions and routing.
     */

    // @Autowired
    // private MatchmakingService matchmakingService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        /*
         * Documentation (Before Override) - Configure message broker options.
         * Configure pub-sub path prefix "/subscribe".
         */
        config.enableSimpleBroker("/subscribe"); // clients subscribe here
        // This is STOMP (WebSocket) pub-sub over the path /subscribe/**.
        config.setApplicationDestinationPrefixes("/app"); // Client sends to "/app/**" - eg. "/app/matchmaking/join"
                                                          // (matchmaking controller)
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        /*
         * Documentation (Before Override) - Register STOMP endpoints mapping each to a
         * specific URL and (optionally) enabling and configuring SockJS fallback
         * options.
         */

        registry.addEndpoint("/gameplay-ws") // endpoint to connect to the websocket - every client should init via this
                .setAllowedOriginPatterns("*") // allow from all (*) origin
                .withSockJS(); // support SockJS fallback

    }

}
