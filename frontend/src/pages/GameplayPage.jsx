import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const GameplayPage = ({
    playerId,
    sessionId,
    opponentId,
    gameState,
    gameStatus,
    onAttack,
    onDisconnect,
    connectionStatus,
}) => {
    const rules = [
        "AIM: Destroy all enemy defence bases.",
        "WINNER: First to eliminate all enemy bases.",
        "Click a cell to attack.",
        "Hit a base - enemy loses the base.",
        "Hit an empty cell - show the count of nearby bases.",
        "TIP: strategise attacks based on the numbers.",
    ];

    if (!gameState) {
        return (
            <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="border-2 border-green-600 max-w-md w-full bg-zinc-900">
                        <div className="bg-zinc-900 p-6 text-center">
                            <h2 className="text-xl font-mono font-bold text-green-500 mb-4">
                                Loading Game...
                            </h2>
                            <div className="flex justify-center">
                                <span className="relative flex size-10 align-middle justify-center items-center">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex size-1 rounded-full bg-green-500"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer onNavigate={() => {}} />
            </div>
        );
    }

    // Determine which player is the current player
    const currentPlayer =
        gameState.player1.playerId === playerId
            ? gameState.player1
            : gameState.player2;
    const opponent =
        gameState.player1.playerId === playerId
            ? gameState.player2
            : gameState.player1;

    // Use the correct field name from backend
    const isMyTurn = currentPlayer.turn;

    // Handle cell click for attacking opponent's grid
    const handleCellClick = (x, y) => {
        // Check game status
        if (gameStatus === "session_expired") {
            alert("Game session expired! Please start a new game.");
            onDisconnect();
            return;
        }

        if (gameStatus === "opponent_disconnected") {
            alert(
                "Your opponent has disconnected! Waiting for reconnection..."
            );
            return;
        }

        // Check connection status
        if (connectionStatus === "disconnected") {
            alert("Connection lost! Please reconnect.");
            onDisconnect();
            return;
        }

        if (!isMyTurn) {
            alert("It's not your turn!");
            return;
        }

        // Check if cell is already attacked
        const opponentCell = opponent.grid.grid[x][y];
        if (opponentCell.hit) {
            alert("Cell already attacked!");
            return;
        }

        onAttack(x, y);
    };

    // Get status display info
    const getStatusDisplay = () => {
        if (gameStatus === "session_expired") {
            return {
                text: "SESSION EXPIRED",
                className: "text-red-400 font-bold animate-pulse",
            };
        }
        if (gameStatus === "opponent_disconnected") {
            return {
                text: "OPPONENT DISCONNECTED",
                className: "text-yellow-400 font-bold animate-pulse",
            };
        }
        if (connectionStatus === "disconnected") {
            return {
                text: "CONNECTION LOST",
                className: "text-red-400 font-bold animate-pulse",
            };
        }
        return {
            text: isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN",
            className: isMyTurn ? "text-green-400" : "text-red-400",
        };
    };

    const statusDisplay = getStatusDisplay();

    // Render a single grid
    const renderGrid = (grid, isOpponentGrid = false, title) => {
        return (
            <div className="border border-green-600 bg-zinc-900 p-3">
                <h3 className="font-mono text-sm font-bold text-green-400 mb-2 text-center">
                    {title}
                </h3>
                <div className="grid grid-cols-10 gap-0.5 w-fit mx-auto">
                    {grid.grid.map((row, x) =>
                        row.map((cell, y) => {
                            let cellClass =
                                "w-6 h-6 border border-green-600 text-xs font-mono flex items-center justify-center cursor-pointer";
                            let cellContent = "";

                            if (isOpponentGrid) {
                                if (cell.hit) {
                                    if (cell.hasBase) {
                                        cellClass += " bg-red-600 text-white";
                                        cellContent = "X";
                                    } else {
                                        if (cell.number && cell.number > 0) {
                                            cellClass +=
                                                " bg-yellow-600 text-zinc-950 font-bold";
                                            cellContent =
                                                cell.number.toString();
                                        } else {
                                            cellClass +=
                                                " bg-zinc-700 text-green-300";
                                            cellContent = "•";
                                        }
                                    }
                                } else {
                                    cellClass +=
                                        " bg-zinc-950 hover:bg-zinc-800";
                                    cellContent = "";
                                }
                            } else {
                                if (cell.hasBase) {
                                    if (cell.hit) {
                                        cellClass += " bg-red-600 text-white";
                                        cellContent = "X";
                                    } else {
                                        cellClass +=
                                            " bg-green-600 text-zinc-950";
                                        cellContent = "B";
                                    }
                                } else {
                                    if (cell.hit) {
                                        if (cell.number && cell.number > 0) {
                                            cellClass +=
                                                " bg-yellow-600 text-zinc-950 font-bold";
                                            cellContent =
                                                cell.number.toString();
                                        } else {
                                            cellClass +=
                                                " bg-zinc-700 text-green-300";
                                            cellContent = "•";
                                        }
                                    } else {
                                        if (cell.number && cell.number > 0) {
                                            cellClass +=
                                                " bg-zinc-950 text-green-500";
                                            cellContent =
                                                cell.number.toString();
                                        } else {
                                            cellClass += " bg-zinc-950";
                                            cellContent = "";
                                        }
                                    }
                                }
                            }

                            const canClick =
                                isOpponentGrid &&
                                isMyTurn &&
                                connectionStatus === "connected" &&
                                gameStatus === "active";

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className={cellClass}
                                    onClick={
                                        isOpponentGrid
                                            ? () => handleCellClick(x, y)
                                            : undefined
                                    }
                                    style={{
                                        cursor: canClick
                                            ? "pointer"
                                            : "default",
                                        opacity:
                                            connectionStatus ===
                                                "disconnected" ||
                                            gameStatus === "session_expired" ||
                                            gameStatus ===
                                                "opponent_disconnected"
                                                ? 0.5
                                                : 1,
                                    }}
                                >
                                    {cellContent}
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="mt-2 text-center">
                    <p className="font-mono text-xs text-green-400">
                        Defences: {grid.defences}/10
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
            <Header />
            <main className="flex-1 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="border border-green-600 bg-zinc-900 p-4 mb-4">
                        <div className="flex justify-between items-center font-mono text-sm">
                            <div>
                                <span className="text-green-400">
                                    Session Established
                                </span>
                            </div>
                            <div>
                                <span
                                    className={`${statusDisplay.className} font-bold`}
                                >
                                    {statusDisplay.text}
                                </span>
                            </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center font-mono text-xs">
                            <div>
                                <span className="text-green-400">
                                    Connection:
                                </span>
                                <span
                                    className={`ml-2 ${
                                        connectionStatus === "connected"
                                            ? "text-green-500"
                                            : "text-red-400"
                                    }`}
                                >
                                    {connectionStatus.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className="text-green-400">
                                    Game Status:
                                </span>
                                <span
                                    className={`ml-2 ${
                                        gameStatus === "active"
                                            ? "text-green-500"
                                            : gameStatus ===
                                              "opponent_disconnected"
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                    }`}
                                >
                                    {gameStatus.replace("_", " ").toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {(gameStatus === "session_expired" ||
                        gameStatus === "opponent_disconnected" ||
                        connectionStatus === "disconnected") && (
                        <div className="border border-red-600 bg-red-900/20 p-4 mb-4">
                            <p className="font-mono text-sm text-red-400 text-center">
                                !!!{" "}
                                {gameStatus === "session_expired"
                                    ? "Game session expired"
                                    : gameStatus === "opponent_disconnected"
                                    ? "Opponent disconnected - waiting for reconnection"
                                    : "Connection lost"}
                                {gameStatus === "session_expired"
                                    ? "! Please disconnect and start a new game."
                                    : ""}{" "}
                                !!!
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div>
                            {renderGrid(currentPlayer.grid, false, "YOUR GRID")}
                        </div>
                        <div>
                            {renderGrid(
                                opponent.grid,
                                true,
                                gameStatus === "session_expired"
                                    ? "OPPONENT'S GRID - SESSION EXPIRED"
                                    : gameStatus === "opponent_disconnected"
                                    ? "OPPONENT'S GRID - OPPONENT DISCONNECTED"
                                    : connectionStatus === "connected" &&
                                      gameStatus === "active"
                                    ? "OPPONENT'S GRID - CLICK TO ATTACK"
                                    : "OPPONENT'S GRID - DISCONNECTED"
                            )}
                        </div>
                    </div>

                    <div className="border border-green-600 bg-zinc-900 p-4 mb-4">
                        <h3 className="font-mono text-sm font-bold text-green-400 mb-2">
                            LEGEND
                        </h3>
                        <div className="grid grid-cols-2 gap-4 font-mono text-xs border-b border-green-600 pb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 bg-green-600 border border-green-600 flex items-center justify-center text-zinc-950 text-xs font-bold">
                                        B
                                    </div>
                                    <span>Your Base</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 bg-red-600 border border-green-600 flex items-center justify-center text-white text-xs">
                                        X
                                    </div>
                                    <span>Hit Base</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-600 border border-green-600 flex items-center justify-center text-zinc-950 text-xs font-bold">
                                        #
                                    </div>
                                    <span>Adjacent enemy bases</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 bg-zinc-700 border border-green-600 flex items-center justify-center text-green-300">
                                        •
                                    </div>
                                    <span>Miss</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 bg-zinc-950 border border-green-600"></div>
                                    <span>Unknown/Empty</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-zinc-950 border border-green-600 flex items-center justify-center text-green-500 text-xs">
                                        #
                                    </div>
                                    <span>Your numbers (visible)</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="font-mono text-sm font-bold text-green-400 my-2">
                            RULES
                        </h3>
                        <div className="bg-zinc-950 p-2">
                            <ul className="font-mono text-sm leading-relaxed">
                                {rules.map((rule, index) => (
                                    <li key={index}>{"> "} {rule}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={onDisconnect}
                            className="bg-red-600 text-zinc-950 font-mono font-bold py-2 px-6 border border-red-600 hover:bg-zinc-900 hover:text-red-600 transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </main>
            <Footer onNavigate={() => {}} />
        </div>
    );
};

export default GameplayPage;
