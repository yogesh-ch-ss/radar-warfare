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
    const [myGrid, setMyGrid] = useState(
        Array(10)
            .fill()
            .map(() => Array(10).fill(""))
    );
    const [enemyGrid, setEnemyGrid] = useState(
        Array(10)
            .fill()
            .map(() => Array(10).fill(""))
    );
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [gameStatus, setGameStatus] = useState("waiting");
    const [myDefences, setMyDefences] = useState(10);
    const [enemyDefences, setEnemyDefences] = useState(10);

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

                        // Connect to gameplay and go directly to game
                        connectToGameplay(matchInfo);
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
                        const newGameState = JSON.parse(message.body);
                        console.log(
                            "Game State Update Received:",
                            newGameState
                        );
                        handleGameStateUpdate(newGameState);
                    });

                    // Subscribe to game end messages
                    const gameEndTopic =
                        "/subscribe/game/" + matchInfo.sessionID + "/end";
                    gameplayClient.subscribe(gameEndTopic, (message) => {
                        const endGameData = JSON.parse(message.body);
                        console.log("Game ended:", endGameData);
                        handleGameEnd(endGameData);
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

            gameplayClient.ws.onclose = () => {
                console.warn("Gameplay WebSocket disconnected.");
                setConnectionStatus("disconnected");
            };
        } catch (error) {
            console.error("Failed to connect to gameplay:", error);
        }
    };

    // Handle game state updates from backend
    const handleGameStateUpdate = (matchInfo) => {
        console.log("Processing MatchInfo:", matchInfo);
        setGameState(matchInfo);

        // Determine which player is me and which is opponent
        let myPlayer, enemyPlayer;
        if (matchInfo.player1.playerId === playerId) {
            myPlayer = matchInfo.player1;
            enemyPlayer = matchInfo.player2;
        } else {
            myPlayer = matchInfo.player2;
            enemyPlayer = matchInfo.player1;
        }

        // Update my grid - show my own bases and hits
        const newMyGrid = Array(10)
            .fill()
            .map(() => Array(10).fill(""));
        if (myPlayer.grid && myPlayer.grid.grid) {
            myPlayer.grid.grid.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell.hasBase && cell.isHit) {
                        newMyGrid[rowIndex][colIndex] = "hit"; // My base was hit
                    } else if (cell.hasBase) {
                        newMyGrid[rowIndex][colIndex] = "ship"; // My unhit base
                    } else if (cell.isHit) {
                        newMyGrid[rowIndex][colIndex] = "miss"; // Empty cell was hit
                    }
                });
            });
        }
        setMyGrid(newMyGrid);

        // Update enemy grid - only show what I've discovered
        const newEnemyGrid = Array(10)
            .fill()
            .map(() => Array(10).fill(""));
        if (enemyPlayer.grid && enemyPlayer.grid.grid) {
            enemyPlayer.grid.grid.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell.isHit) {
                        if (cell.hasBase) {
                            newEnemyGrid[rowIndex][colIndex] = "hit"; // Enemy base hit
                        } else {
                            newEnemyGrid[rowIndex][colIndex] = "miss"; // Empty cell hit
                        }
                    }
                    // Don't show enemy bases that haven't been hit
                });
            });
        }
        setEnemyGrid(newEnemyGrid);

        // Update turn status
        setIsMyTurn(myPlayer.isTurn);

        // Update defences
        setMyDefences(myPlayer.grid?.defences || 10);
        setEnemyDefences(enemyPlayer.grid?.defences || 10);

        // Update game status
        setGameStatus("playing");
    };

    // Handle game end
    const handleGameEnd = (endGameData) => {
        console.log("Game ended. Winner:", endGameData.winnerId);

        if (endGameData.winnerId === playerId) {
            setGameStatus("won");
            alert("Congratulations! You won!");
        } else {
            setGameStatus("lost");
            alert("Game Over! You lost.");
        }

        // Auto-navigate back to home after a short delay
        setTimeout(() => {
            handleCancelMatchmaking();
            setCurrentPage("home");
        }, 3000);
    };

    // Handle cell click for attacks
    const handleCellClick = (row, col) => {
        if (
            !isMyTurn ||
            !gameplayClientRef.current ||
            !gameplayClientRef.current.connected ||
            gameStatus !== "playing"
        ) {
            console.log("Cannot attack - not your turn or game not active");
            return;
        }

        // Check if cell is already attacked
        if (enemyGrid[row][col] !== "") {
            console.log("Cell already attacked");
            return;
        }

        const attackPayload = {
            sessionId: sessionId,
            attackerId: playerId,
            x: row,
            y: col,
        };

        gameplayClientRef.current.send(
            "/app/gameplay/attack",
            {},
            JSON.stringify(attackPayload)
        );
        console.log("Sent attack payload:", attackPayload);
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
        setGameState(null);
        setMyGrid(
            Array(10)
                .fill()
                .map(() => Array(10).fill(""))
        );
        setEnemyGrid(
            Array(10)
                .fill()
                .map(() => Array(10).fill(""))
        );
        setIsMyTurn(false);
        setGameStatus("waiting");
        setMyDefences(10);
        setEnemyDefences(10);

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
                        onNavigate={handleNavigate}
                        playerId={playerId}
                        opponentId={opponentId}
                        sessionId={sessionId}
                        myGrid={myGrid}
                        enemyGrid={enemyGrid}
                        isMyTurn={isMyTurn}
                        gameStatus={gameStatus}
                        myDefences={myDefences}
                        enemyDefences={enemyDefences}
                        onCellClick={handleCellClick}
                        onEndGame={() => {
                            handleCancelMatchmaking();
                            setCurrentPage("home");
                        }}
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

const generatePlayerId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export default App;
