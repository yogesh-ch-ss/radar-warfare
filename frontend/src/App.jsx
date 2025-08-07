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
    const [gameStatus, setGameStatus] = useState("active"); // "active", "opponent_disconnected", "session_expired"

    // WebSocket client references
    const matchmakingClientRef = useRef(null);
    const gameplayClientRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);

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

    // Start heartbeat mechanism
    const startHeartbeat = (playerIdToUse, sessionIdToUse) => {
        // Clear any existing heartbeat
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        heartbeatIntervalRef.current = setInterval(() => {
            if (
                gameplayClientRef.current &&
                gameplayClientRef.current.connected
            ) {
                const heartbeatPayload = {
                    sessionId: sessionIdToUse,
                    playerId: playerIdToUse,
                    timestamp: Date.now(),
                };

                gameplayClientRef.current.send(
                    "/app/gameplay/heartbeat",
                    {},
                    JSON.stringify(heartbeatPayload)
                );
                console.log("Heartbeat sent:", heartbeatPayload);
            }
        }, 10000); // Send heartbeat every 10 seconds
    };

    // Stop heartbeat mechanism
    const stopHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
            console.log("Heartbeat stopped");
        }
    };

    // Connect to matchmaking WebSocket
    const connectToMatchmaking = (playerIdToUse) => {
        try {
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
                        const opponent =
                            matchInfo.player1ID === playerIdToUse
                                ? matchInfo.player2ID
                                : matchInfo.player1ID;
                        setOpponentId(opponent);

                        // Connect to gameplay
                        connectToGameplay(matchInfo, playerIdToUse);

                        // Navigate to game lobby
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
    const connectToGameplay = (matchInfo, playerIdToUse) => {
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
                    });

                    // Subscribe to heartbeat responses
                    const heartbeatTopic =
                        "/subscribe/game/" +
                        matchInfo.sessionID +
                        "/heartbeat/" +
                        playerIdToUse;
                    gameplayClient.subscribe(heartbeatTopic, (message) => {
                        const heartbeatResponse = JSON.parse(message.body);
                        console.log("Heartbeat response:", heartbeatResponse);

                        if (heartbeatResponse.status === "session_active") {
                            setGameStatus("active");
                        } else if (
                            heartbeatResponse.status === "opponent_disconnected"
                        ) {
                            setGameStatus("opponent_disconnected");
                        } else if (
                            heartbeatResponse.status === "session_expired"
                        ) {
                            setGameStatus("session_expired");
                            alert("Game session expired! Disconnecting...");
                            handleDisconnect();
                        }
                    });

                    // Subscribe to end game notifications
                    const endGameTopic =
                        "/subscribe/game/" + matchInfo.sessionID + "/end";
                    gameplayClient.subscribe(endGameTopic, (message) => {
                        const endGamePayload = JSON.parse(message.body);
                        console.log("Game Ended:", endGamePayload);

                        let winStatus = "GAME OVER!";
                        if (endGamePayload.winnerId) {
                            winStatus =
                                endGamePayload.winnerId === playerId
                                    ? "YOU WIN!"
                                    : "YOU LOSE!";
                        }

                        alert(`Game Over! ${winStatus}`);
                        handleDisconnect();
                    });

                    console.log(
                        "Subscribed to game topics:",
                        gameTopic,
                        heartbeatTopic,
                        endGameTopic
                    );

                    // Small delay to ensure subscription is established before sending init
                    setTimeout(() => {
                        gameplayClient.send(
                            "/app/gameplay/init",
                            {},
                            JSON.stringify(matchInfo)
                        );
                        console.log(
                            "Sent MatchInfoDTO to gameplay-service for init:",
                            matchInfo
                        );

                        // Start heartbeat after game initialization
                        startHeartbeat(playerIdToUse, matchInfo.sessionID);
                    }, 3000);
                },
                (error) => {
                    console.error("Gameplay connection error:", error);
                }
            );

            // Detect WebSocket closure
            gameplayClient.ws.onclose = () => {
                console.warn("Gameplay WebSocket disconnected.");
                setConnectionStatus("disconnected");
                stopHeartbeat();

                // If we're in gameplay and connection is lost, show alert and disconnect
                if (currentPage === "gameplay") {
                    alert("Connection lost! Game disconnected.");
                    handleDisconnect();
                }
            };
        } catch (error) {
            console.error("Failed to connect to gameplay:", error);
        }
    };

    // Send attack function
    const handleAttack = (x, y) => {
        // Check game status first
        if (gameStatus === "session_expired") {
            alert("Game session expired! Please start a new game.");
            handleDisconnect();
            return;
        }

        if (gameStatus === "opponent_disconnected") {
            alert("Your opponent has disconnected! Game will end soon.");
            return;
        }

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
        } else {
            // Connection lost during gameplay
            alert("Connection lost! Please reconnect.");
            handleDisconnect();
        }
    };

    // Cancel matchmaking
    const handleCancelMatchmaking = () => {
        handleDisconnect();
    };

    // Disconnect function
    const handleDisconnect = () => {
        // Stop heartbeat
        stopHeartbeat();

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
        setGameStatus("active");

        // Navigate back to home
        setCurrentPage("home");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopHeartbeat();
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
                        gameStatus={gameStatus}
                        onAttack={handleAttack}
                        onDisconnect={handleDisconnect}
                        connectionStatus={connectionStatus}
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
