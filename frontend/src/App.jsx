import React, { useState, useRef, useEffect } from "react";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import RulesPage from "./pages/RulesPage";
import MatchmakingPage from "./pages/MatchmakingPage";
import GameLobbyPage from "./pages/GameLobbyPage";

const generatePlayerId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const App = () => {
    const [currentPage, setCurrentPage] = useState("home");
    const [playerId, setPlayerId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [opponentId, setOpponentId] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("disconnected");

    // WebSocket client references
    const matchmakingClientRef = useRef(null);
    const gameplayClientRef = useRef(null);

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

                        // Navigate to game lobby
                        setCurrentPage("lobby");
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
                        const gameState = JSON.parse(message.body);
                        console.log("Game State Update Received:", gameState);
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

    // Cancel matchmaking
    const handleCancelMatchmaking = () => {
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
            case "lobby":
                return (
                    <GameLobbyPage
                        onNavigate={handleNavigate}
                        playerId={playerId}
                        sessionId={sessionId}
                        opponentId={opponentId}
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
