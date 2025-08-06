import Header from "../components/Header";
import Footer from "../components/Footer";

const GameplayPage = ({
    playerId,
    sessionId,
    opponentId,
    gameState,
    onAttack,
    onDisconnect,
}) => {
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
                                <span className="relative flex size-10">
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

    // Handle both possible field names from backend
    const isMyTurn = currentPlayer.turn || currentPlayer.isTurn;

    console.log("Current player:", currentPlayer.playerId);
    console.log("Is my turn:", isMyTurn);
    console.log("Player turn field:", currentPlayer.turn);
    console.log("Player isTurn field:", currentPlayer.isTurn);

    // Handle cell click for attacking opponent's grid
    const handleCellClick = (x, y) => {
        if (!isMyTurn) {
            alert("It's not your turn!");
            return;
        }

        // Check if cell is already attacked
        const opponentCell = opponent.grid.grid[x][y];
        if (opponentCell.isHit) {
            alert("Cell already attacked!");
            return;
        }

        onAttack(x, y);
    };

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
                                // For opponent's grid: show only hits/misses, not bases
                                if (cell.isHit) {
                                    if (cell.hasBase) {
                                        cellClass += " bg-red-600 text-white"; // Hit with base
                                        cellContent = "X";
                                    } else {
                                        cellClass +=
                                            " bg-zinc-700 text-green-300"; // Miss
                                        cellContent = "•";
                                    }
                                } else {
                                    cellClass +=
                                        " bg-zinc-950 hover:bg-zinc-800"; // Unexplored
                                    cellContent = "";
                                }
                            } else {
                                // For own grid: show bases and hits
                                if (cell.hasBase) {
                                    if (cell.isHit) {
                                        cellClass += " bg-red-600 text-white"; // Own base hit
                                        cellContent = "X";
                                    } else {
                                        cellClass +=
                                            " bg-green-600 text-zinc-950"; // Own base safe
                                        cellContent = "B";
                                    }
                                } else {
                                    if (cell.isHit) {
                                        cellClass +=
                                            " bg-zinc-700 text-green-300"; // Empty cell hit
                                        cellContent = "•";
                                    } else {
                                        cellClass += " bg-zinc-950"; // Empty cell safe
                                        cellContent = "";
                                    }
                                }
                            }

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
                                        cursor:
                                            isOpponentGrid && isMyTurn
                                                ? "pointer"
                                                : "default",
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
                        Defenses: {grid.defences}/10
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
                    {/* Game Status */}
                    <div className="border border-green-600 bg-zinc-900 p-4 mb-4">
                        <div className="flex justify-between items-center font-mono text-sm">
                            <div>
                                <span className="text-green-400">Session:</span>
                                <span className="text-green-500 ml-2">
                                    {sessionId}
                                </span>
                            </div>
                            <div>
                                <span className="text-green-400">vs</span>
                                <span className="text-green-500 ml-2">
                                    {opponentId}
                                </span>
                            </div>
                            <div>
                                <span
                                    className={`${
                                        isMyTurn
                                            ? "text-green-400"
                                            : "text-red-400"
                                    } font-bold`}
                                >
                                    {isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Grids */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {/* Your Grid */}
                        <div>
                            {renderGrid(currentPlayer.grid, false, "YOUR GRID")}
                        </div>

                        {/* Opponent's Grid */}
                        <div>
                            {renderGrid(
                                opponent.grid,
                                true,
                                "OPPONENT'S GRID - CLICK TO ATTACK"
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="border border-green-600 bg-zinc-900 p-4 mb-4">
                        <h3 className="font-mono text-sm font-bold text-green-400 mb-2">
                            LEGEND
                        </h3>
                        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 bg-green-600 border border-green-600"></div>
                                    <span>Your Base</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-600 border border-green-600 flex items-center justify-center text-white text-xs">
                                        X
                                    </div>
                                    <span>Hit Base</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 bg-zinc-700 border border-green-600 flex items-center justify-center text-green-300">
                                        •
                                    </div>
                                    <span>Miss</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-zinc-950 border border-green-600"></div>
                                    <span>Unknown</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disconnect Button */}
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
