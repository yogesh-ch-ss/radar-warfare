import React, { useState, useRef, useEffect } from "react";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import RulesPage from "./pages/RulesPage";
import MatchmakingPage from "./pages/MatchmakingPage";
import GameplayPage from "./pages/GameplayPage";

import Config from "./config/Config";

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
                // Removed detailed heartbeat logging
            }
        }, 10000); // Send heartbeat every 10 seconds
    };

    // Stop heartbeat mechanism
    const stopHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    };

    // Leave matchmaking queue
    const leaveMatchmakingQueue = (playerIdToUse) => {
        if (
            matchmakingClientRef.current &&
            matchmakingClientRef.current.connected
        ) {
            const leavePayload = { playerId: playerIdToUse };
            matchmakingClientRef.current.send(
                "/app/matchmaking/leave",
                {},
                JSON.stringify(leavePayload)
            );

            // Small delay to ensure the message is sent before disconnecting
            setTimeout(() => {
                handleDisconnect();
            }, 500);
        } else {
            handleDisconnect();
        }
    };

    // Connect to matchmaking WebSocket
    const connectToMatchmaking = (playerIdToUse) => {
        try {
            // const socket = new window.SockJS("http://localhost:8081/ws");
            const socket = new window.SockJS(`${Config.MATCHMAKING_URL}/ws`);

            const client = window.Stomp.over(socket);

            // Disable STOMP debug messages completely
            client.debug = null;

            matchmakingClientRef.current = client;

            client.connect(
                {},
                (frame) => {
                    console.log("Connected to Matchmaking");
                    setConnectionStatus("connected");

                    const subscribePath = "/subscribe/match/" + playerIdToUse;
                    client.subscribe(subscribePath, (message) => {
                        const matchInfo = JSON.parse(message.body);
                        console.log("Match found! Connecting to game...");

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

                    // Automatically join matchmaking
                    const payload = { playerId: playerIdToUse };
                    client.send(
                        "/app/matchmaking/join",
                        {},
                        JSON.stringify(payload)
                    );
                    console.log("Joined matchmaking queue");
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
            // const gameplaySocket = new window.SockJS(
            //     "http://localhost:8082/gameplay-ws"
            // );

            const gameplaySocket = new window.SockJS(
                `${Config.GAMEPLAY_URL}/gameplay-ws`
            );

            const gameplayClient = window.Stomp.over(gameplaySocket);

            // Disable STOMP debug messages completely
            gameplayClient.debug = null;

            gameplayClientRef.current = gameplayClient;

            gameplayClient.connect(
                {},
                (frame) => {
                    console.log("Connected to Gameplay");

                    const gameTopic = "/subscribe/game/" + matchInfo.sessionID;
                    gameplayClient.subscribe(gameTopic, (message) => {
                        const gameStateUpdate = JSON.parse(message.body);
                        // Simplified logging - only log essential info
                        console.log("Game state updated");
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
                            // Add delay before showing alert to allow UI to update
                            setTimeout(() => {
                                alert("Game session expired! Disconnecting...");
                                handleDisconnect();
                            }, 500);
                        }
                    });

                    // Subscribe to end game notifications
                    const endGameTopic =
                        "/subscribe/game/" + matchInfo.sessionID + "/end";
                    gameplayClient.subscribe(endGameTopic, (message) => {
                        const endGamePayload = JSON.parse(message.body);
                        console.log("Game ended");

                        let winStatus = "GAME OVER!";
                        if (endGamePayload.winnerId) {
                            winStatus =
                                endGamePayload.winnerId === playerIdToUse
                                    ? "YOU WIN!"
                                    : "YOU LOSE!";
                        }

                        // Add delay before showing alert to allow UI to update
                        setTimeout(() => {
                            alert(`Game Over! ${winStatus}`);
                            handleDisconnect();
                        }, 1000);
                    });

                    // Small delay to ensure subscription is established before sending init
                    setTimeout(() => {
                        gameplayClient.send(
                            "/app/gameplay/init",
                            {},
                            JSON.stringify(matchInfo)
                        );
                        console.log("Game initialized");

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
                console.warn("Gameplay WebSocket disconnected");
                setConnectionStatus("disconnected");
                stopHeartbeat();

                // If we're in gameplay and connection is lost, show alert and disconnect
                if (currentPage === "gameplay") {
                    // Add delay before showing alert to allow UI to update
                    setTimeout(() => {
                        alert("Connection lost! Game disconnected.");
                        handleDisconnect();
                    }, 500);
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
            console.log("Attack sent");
        } else {
            // Connection lost during gameplay
            alert("Connection lost! Please reconnect.");
            handleDisconnect();
        }
    };

    // Cancel matchmaking - this will be called from MatchmakingPage
    const handleCancelMatchmaking = () => {
        // Send leave request to remove player from matchmaking queue
        if (playerId) {
            leaveMatchmakingQueue(playerId);
        } else {
            // If no playerId, just disconnect
            handleDisconnect();
        }
    };

    // Disconnect function (clean disconnection without sending leave message)
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
            // Send leave request if we have a playerId and are in matchmaking
            if (playerId && currentPage === "matchmaking") {
                leaveMatchmakingQueue(playerId);
            }

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
                        connectionStatus={connectionStatus}
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
