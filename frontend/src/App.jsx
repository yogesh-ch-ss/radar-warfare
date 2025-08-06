import React, { useState, useRef, useEffect } from "react";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import RulesPage from "./pages/RulesPage";
import MatchmakingPage from "./pages/MatchmakingPage";
import GameplayPage from "./pages/GameplayPage";

const App = () => {
    const [currentPage, setCurrentPage] = useState("home");
    const [playerId, setPlayerId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [opponentId, setOpponentId] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
    const [gameState, setGameState] = useState(null);

    // WebSocket client references
    const matchmakingClientRef = useRef(null);
    const gameplayClientRef = useRef(null);

    const generatePlayerId = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Navigation function
    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    // Connect and Play function
    const handleConnectAndPlay = () => {
        const newPlayerId = generatePlayerId();
        setPlayerId(newPlayerId);
        connectToMatchmaking(newPlayerId);
        setCurrentPage("matchmaking");
    };

    // Connect to matchmaking WebSocket
    const connectToMatchmaking = (playerIdToUse) => {
        try {
            // Import SockJS and Stomp from CDN (these would need to be added to your HTML)
            const socket = new window.SockJS("http://localhost:8081/ws");
            const client = window.Stomp.over(socket);

            matchmakingClientRef.current = client;

            client.connect(
                {},
                (frame) => {
                    console.log("Connected to Matchmaking: " + frame);
                    setConnectionStatus("connected");

                    const subscribePath = "/subscribe/match/" + playerIdToUse;
                    client.subscribe(subscribePath, (message) => {
                        const matchInfo = JSON.parse(message.body);
                        console.log(
                            "MATCHED!!! MatchInfoDTO received:",
                            matchInfo
                        );

                        setSessionId(matchInfo.sessionID);
                        // Determine opponent ID
                        const opponent =
                            matchInfo.player1ID === playerIdToUse
                                ? matchInfo.player2ID
                                : matchInfo.player1ID;
                        setOpponentId(opponent);

                        // Connect to gameplay
                        connectToGameplay(matchInfo);

                        // Navigate to gameplay
                        setCurrentPage("gameplay");
                    });

                    console.log(
                        "Subscribed to matchmaking topic:",
                        subscribePath
                    );

                    // Automatically join matchmaking
                    const payload = { playerId: playerIdToUse };
                    client.send(
                        "/app/matchmaking/join",
                        {},
                        JSON.stringify(payload)
                    );
                    console.log(
                        "Sent matchmaking join request for:",
                        playerIdToUse
                    );
                },
                (error) => {
                    console.error("Matchmaking connection error:", error);
                    setConnectionStatus("error");
                }
            );
        } catch (error) {
            console.error("Failed to connect to matchmaking:", error);
            setConnectionStatus("error");
        }
    };

    // Connect to gameplay WebSocket
    const connectToGameplay = (matchInfo) => {
        try {
            const gameplaySocket = new window.SockJS(
                "http://localhost:8082/gameplay-ws"
            );
            const gameplayClient = window.Stomp.over(gameplaySocket);

            gameplayClientRef.current = gameplayClient;

            gameplayClient.connect(
                {},
                (frame) => {
                    console.log("Connected to Gameplay: " + frame);

                    const gameTopic = "/subscribe/game/" + matchInfo.sessionID;
                    gameplayClient.subscribe(gameTopic, (message) => {
                        const gameStateUpdate = JSON.parse(message.body);
                        console.log(
                            "Game State Update Received:",
                            gameStateUpdate
                        );
                        setGameState(gameStateUpdate);

                        // Auto-navigate to gameplay when game state is received
                        if (currentPage === "lobby") {
                            setCurrentPage("gameplay");
                        }
                    });

                    // Subscribe to end game notifications
                    const endGameTopic =
                        "/subscribe/game/" + matchInfo.sessionID + "/end";
                    gameplayClient.subscribe(endGameTopic, (message) => {
                        const endGamePayload = JSON.parse(message.body);
                        console.log("Game Ended:", endGamePayload);
                        alert(`Game Over! Winner: ${endGamePayload.winnerId}`);
                        handleDisconnect();
                    });

                    gameplayClient.send(
                        "/app/gameplay/init",
                        {},
                        JSON.stringify(matchInfo)
                    );
                    console.log(
                        "Sent MatchInfoDTO to gameplay-service for init"
                    );
                },
                (error) => {
                    console.error("Gameplay connection error:", error);
                }
            );

            // Detect WebSocket closure
            gameplayClient.ws.onclose = () => {
                console.warn("Gameplay WebSocket disconnected.");
                setConnectionStatus("disconnected");
            };
        } catch (error) {
            console.error("Failed to connect to gameplay:", error);
        }
    };

    // Send attack function
    const handleAttack = (x, y) => {
        if (gameplayClientRef.current && gameplayClientRef.current.connected) {
            const attackPayload = {
                sessionId: sessionId,
                attackerId: playerId,
                x: x,
                y: y,
            };

            gameplayClientRef.current.send(
                "/app/gameplay/attack",
                {},
                JSON.stringify(attackPayload)
            );
            console.log("Sent attack payload:", attackPayload);
        }
    };

    // Cancel matchmaking
    const handleCancelMatchmaking = () => {
        handleDisconnect();
    };

    // Disconnect function
    const handleDisconnect = () => {
        // Disconnect from matchmaking
        if (
            matchmakingClientRef.current &&
            matchmakingClientRef.current.connected
        ) {
            matchmakingClientRef.current.disconnect(() => {
                console.log("Disconnected from matchmaking");
            });
        }

        // Disconnect from gameplay if connected
        if (gameplayClientRef.current && gameplayClientRef.current.connected) {
            gameplayClientRef.current.disconnect(() => {
                console.log("Disconnected from gameplay");
            });
        }

        // Reset state
        setConnectionStatus("disconnected");
        setPlayerId("");
        setSessionId("");
        setOpponentId("");
        setGameState(null);

        // Navigate back to home
        setCurrentPage("home");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (
                matchmakingClientRef.current &&
                matchmakingClientRef.current.connected
            ) {
                matchmakingClientRef.current.disconnect();
            }
            if (
                gameplayClientRef.current &&
                gameplayClientRef.current.connected
            ) {
                gameplayClientRef.current.disconnect();
            }
        };
    }, []);

    // Render current page
    const renderCurrentPage = () => {
        switch (currentPage) {
            case "home":
                return (
                    <HomePage
                        onNavigate={handleNavigate}
                        onConnectAndPlay={handleConnectAndPlay}
                    />
                );
            case "matchmaking":
                return (
                    <MatchmakingPage
                        onNavigate={handleNavigate}
                        playerId={playerId}
                        onCancel={handleCancelMatchmaking}
                    />
                );
            case "gameplay":
                return (
                    <GameplayPage
                        playerId={playerId}
                        sessionId={sessionId}
                        opponentId={opponentId}
                        gameState={gameState}
                        onAttack={handleAttack}
                        onDisconnect={handleDisconnect}
                    />
                );
            case "rules":
                return <RulesPage onNavigate={handleNavigate} />;
            case "about":
                return <AboutPage onNavigate={handleNavigate} />;
            default:
                return (
                    <HomePage
                        onNavigate={handleNavigate}
                        onConnectAndPlay={handleConnectAndPlay}
                    />
                );
        }
    };

    return <div className="App">{renderCurrentPage()}</div>;
};

export default App;
