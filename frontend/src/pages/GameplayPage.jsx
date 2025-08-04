import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const GameplayPage = ({
    onNavigate,
    playerId,
    opponentId,
    sessionId,
    myGrid,
    enemyGrid,
    isMyTurn,
    gameStatus,
    onCellClick,
    onEndGame,
}) => {
    const renderGrid = (grid, isEnemyGrid = false, title = "") => {
        const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

        return (
            <div className="w-full">
                <h3 className="text-green-400 font-mono text-lg font-bold mb-2 text-center">
                    {title}
                </h3>
                <div className="bg-zinc-950 border border-green-600 p-2 sm:p-4">
                    <div className="grid grid-cols-11 gap-0 text-xs sm:text-sm font-mono">
                        {/* Header row */}
                        <div className="bg-zinc-800 border border-green-600 p-1 text-center text-green-400"></div>
                        {columns.map((col) => (
                            <div
                                key={col}
                                className="bg-zinc-800 border border-green-600 p-1 text-center text-green-400"
                            >
                                {col}
                            </div>
                        ))}

                        {/* Grid rows */}
                        {grid.map((row, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                {/* Row number */}
                                <div className="bg-zinc-800 border border-green-600 p-1 text-center text-green-400">
                                    {rowIndex + 1}
                                </div>
                                {/* Grid cells */}
                                {row.map((cell, colIndex) => {
                                    const cellKey = `${rowIndex}-${colIndex}`;
                                    const isClickable =
                                        isEnemyGrid && isMyTurn && cell === "";

                                    let cellStyle =
                                        "border border-green-600 aspect-square flex items-center justify-center text-xs cursor-default ";
                                    let cellContent = "";

                                    // Cell styling based on state
                                    if (cell === "ship" || cell === "*") {
                                        // Own ships (only visible on own grid)
                                        cellStyle += "bg-blue-600 text-white";
                                        cellContent = "●";
                                    } else if (cell === "hit" || cell === "x") {
                                        // Hit
                                        cellStyle += "bg-red-600 text-white";
                                        cellContent = "✕";
                                    } else if (
                                        cell === "miss" ||
                                        cell === "o"
                                    ) {
                                        // Miss
                                        cellStyle +=
                                            "bg-zinc-700 text-green-400";
                                        cellContent = "○";
                                    } else {
                                        // Empty cell
                                        cellStyle +=
                                            "bg-zinc-900 text-green-500";

                                        if (isClickable) {
                                            cellStyle +=
                                                " hover:bg-green-500/20 cursor-pointer transition-colors";
                                        }
                                    }

                                    return (
                                        <div
                                            key={cellKey}
                                            className={cellStyle}
                                            onClick={() =>
                                                isClickable &&
                                                onCellClick(rowIndex, colIndex)
                                            }
                                        >
                                            {cellContent}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const calculateBasesRemaining = (grid) => {
        let bases = 0;
        grid.forEach((row) => {
            row.forEach((cell) => {
                if (cell === "ship" || cell === "*") bases++;
            });
        });
        return bases;
    };

    const myBasesRemaining = calculateBasesRemaining(myGrid);

    return (
        <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
            <Header />

            <main className="flex-1 p-2 sm:p-4">
                {/* Desktop Layout */}
                <div className="hidden lg:block">
                    <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {/* Left - Legend */}
                        <div className="space-y-4">
                            <div className="bg-zinc-900 border border-green-600">
                                <div className="bg-zinc-800 border-b border-green-600 p-3">
                                    <h3 className="font-mono font-bold text-green-400">
                                        LEGEND
                                    </h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center space-x-3 font-mono text-sm">
                                        <div className="w-6 h-6 bg-blue-600 border border-green-600 flex items-center justify-center text-white">
                                            ●
                                        </div>
                                        <span>Your Base</span>
                                    </div>
                                    <div className="flex items-center space-x-3 font-mono text-sm">
                                        <div className="w-6 h-6 bg-red-600 border border-green-600 flex items-center justify-center text-white">
                                            ✕
                                        </div>
                                        <span>Hit</span>
                                    </div>
                                    <div className="flex items-center space-x-3 font-mono text-sm">
                                        <div className="w-6 h-6 bg-zinc-700 border border-green-600 flex items-center justify-center text-green-400">
                                            ○
                                        </div>
                                        <span>Miss</span>
                                    </div>
                                </div>
                            </div>

                            {/* Player Info */}
                            <div className="bg-zinc-900 border border-green-600">
                                <div className="bg-zinc-800 border-b border-green-600 p-3">
                                    <h3 className="font-mono font-bold text-green-400">
                                        BATTLE STATUS
                                    </h3>
                                </div>
                                <div className="p-4 space-y-2 font-mono text-sm">
                                    <div>Player: {playerId}</div>
                                    <div>Opponent: {opponentId}</div>
                                    <div>Session: {sessionId}</div>
                                    <div
                                        className={`${
                                            isMyTurn
                                                ? "text-green-400"
                                                : "text-red-400"
                                        }`}
                                    >
                                        {isMyTurn ? "YOUR TURN" : "ENEMY TURN"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center - My Grid */}
                        <div>
                            {renderGrid(
                                myGrid,
                                false,
                                `${playerId} (YOU) - Bases: ${myBasesRemaining}`
                            )}
                        </div>

                        {/* Right - Enemy Grid & Controls */}
                        <div className="space-y-4">
                            {renderGrid(
                                enemyGrid,
                                true,
                                `${opponentId} (ENEMY)`
                            )}

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => onNavigate("rules")}
                                    className="bg-zinc-900 text-green-500 font-mono font-bold py-2 px-4 border border-green-600 hover:bg-green-500/20 transition-colors text-sm"
                                >
                                    Rules
                                </button>
                                <button
                                    onClick={onEndGame}
                                    className="bg-red-600 text-zinc-950 font-mono font-bold py-2 px-4 border border-red-600 hover:bg-zinc-900 hover:text-red-600 transition-colors text-sm"
                                >
                                    END GAME
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden space-y-4">
                    {/* Top Controls */}
                    <div className="flex justify-between items-center">
                        <div className="bg-zinc-900 border border-green-600 p-2">
                            <div className="font-mono text-xs text-green-400">
                                {isMyTurn ? "YOUR TURN" : "ENEMY TURN"}
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => onNavigate("rules")}
                                className="bg-zinc-900 text-green-500 font-mono font-bold py-1 px-2 border border-green-600 hover:bg-green-500/20 transition-colors text-xs"
                            >
                                Rules
                            </button>
                            <button
                                onClick={onEndGame}
                                className="bg-red-600 text-zinc-950 font-mono font-bold py-1 px-2 border border-red-600 hover:bg-zinc-900 hover:text-red-600 transition-colors text-xs"
                            >
                                END
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-zinc-900 border border-green-600">
                        <div className="bg-zinc-800 border-b border-green-600 p-2">
                            <h3 className="font-mono font-bold text-green-400 text-sm">
                                LEGEND
                            </h3>
                        </div>
                        <div className="p-3 grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center space-x-2 font-mono">
                                <div className="w-4 h-4 bg-blue-600 border border-green-600 flex items-center justify-center text-white text-xs">
                                    ●
                                </div>
                                <span>Base</span>
                            </div>
                            <div className="flex items-center space-x-2 font-mono">
                                <div className="w-4 h-4 bg-red-600 border border-green-600 flex items-center justify-center text-white text-xs">
                                    ✕
                                </div>
                                <span>Hit</span>
                            </div>
                            <div className="flex items-center space-x-2 font-mono">
                                <div className="w-4 h-4 bg-zinc-700 border border-green-600 flex items-center justify-center text-green-400 text-xs">
                                    ○
                                </div>
                                <span>Miss</span>
                            </div>
                        </div>
                    </div>

                    {/* My Grid */}
                    <div>
                        {renderGrid(
                            myGrid,
                            false,
                            `${playerId} (YOU) - Bases: ${myBasesRemaining}`
                        )}
                    </div>

                    {/* Enemy Grid */}
                    <div>
                        {renderGrid(enemyGrid, true, `${opponentId} (ENEMY)`)}
                    </div>

                    {/* Player Info */}
                    <div className="bg-zinc-900 border border-green-600">
                        <div className="bg-zinc-800 border-b border-green-600 p-2">
                            <h3 className="font-mono font-bold text-green-400 text-sm">
                                SESSION INFO
                            </h3>
                        </div>
                        <div className="p-3 space-y-1 font-mono text-xs">
                            <div>Player: {playerId}</div>
                            <div>Opponent: {opponentId}</div>
                            <div>Session: {sessionId}</div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default GameplayPage;
