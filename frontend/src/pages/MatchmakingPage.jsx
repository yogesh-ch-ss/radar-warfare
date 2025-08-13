import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MatchmakingPage = ({
    onNavigate,
    playerId,
    onCancel,
    connectionStatus,
}) => {
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes = 120 seconds
    const [timeoutTriggered, setTimeoutTriggered] = useState(false);

    useEffect(() => {
        // Start countdown timer
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Only trigger timeout if we haven't already triggered it
                    if (!timeoutTriggered) {
                        setTimeoutTriggered(true);
                        handleTimeout();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup on unmount
        return () => {
            clearInterval(timer);
        };
    }, [timeoutTriggered]);

    // Handle timeout - exactly like cancel button
    const handleTimeout = () => {
        console.log("Matchmaking timeout reached for player:", playerId);
        alert("No match found. Disconnecting...");

        // Call the same cancel function that the Cancel button uses
        // This ensures the "matchmaking/leave" message is sent
        onCancel();
    };

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="border-2 border-green-600 max-w-md w-full bg-zinc-900">
                    <div className="bg-zinc-900 p-6 flex flex-col items-center justify-center align-middle">
                        <h2 className="text-xl font-mono font-bold text-center mb-4">
                            Finding Match...
                        </h2>
                        {/* <div className="bg-zinc-950 border border-green-600 p-3 mb-4 w-full">
                            <p className="font-mono text-xs text-center text-green-400">
                                PLAYER ID: {playerId}
                            </p>
                        </div> */}

                        {/* Connection Status */}
                        <div className="bg-zinc-950 border border-green-600 p-3 mb-4 w-full">
                            <p className="font-mono text-xs text-center text-green-400">
                                CONNECTION:{" "}
                                <span
                                    className={
                                        connectionStatus === "connected"
                                            ? "text-green-500"
                                            : "text-red-400"
                                    }
                                >
                                    {connectionStatus.toUpperCase()}
                                </span>
                            </p>
                        </div>

                        {/* Countdown Timer */}
                        <div className="bg-zinc-950 border border-green-600 p-3 mb-6 w-full">
                            <p className="font-mono text-xs text-center text-green-400">
                                TIME REMAINING:{" "}
                                <span
                                    className={
                                        timeRemaining <= 30
                                            ? "text-yellow-400 animate-pulse"
                                            : "text-green-500"
                                    }
                                >
                                    {formatTime(timeRemaining)}
                                </span>
                            </p>
                        </div>

                        {/* Only show loading animation if not timed out */}
                        {timeRemaining > 0 && (
                            <div className="flex justify-center mb-6">
                                <span className="relative flex size-10 align-middle justify-center items-center">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex size-1 rounded-full bg-green-500"></span>
                                </span>
                            </div>
                        )}

                        {/* Status message */}
                        <p className="font-mono text-sm text-center mb-6">
                            {timeRemaining > 0
                                ? "SCANNING FOR AVAILABLE OPPONENT..."
                                : "TIMEOUT REACHED - DISCONNECTING..."}
                        </p>

                        {/* Show timeout warning when less than 30 seconds left */}
                        {timeRemaining <= 10 && timeRemaining > 0 && (
                            <div className="border border-yellow-600 bg-yellow-900/20 p-3 mb-4 w-full">
                                <p className="font-mono text-xs text-center text-yellow-400">
                                    !!! NO MATCH FOUND - DISCONNECTING SOON !!!
                                </p>
                            </div>
                        )}

                        {/* Show timeout message when time is up */}
                        {timeRemaining <= 0 && (
                            <div className="border border-red-600 bg-red-900/20 p-3 mb-4 w-full">
                                <p className="font-mono text-xs text-center text-red-400">
                                    !!! TIMEOUT - NO OPPONENTS FOUND !!!
                                </p>
                            </div>
                        )}

                        {/* Cancel button - disabled after timeout */}
                        <button
                            onClick={onCancel}
                            disabled={timeRemaining <= 0}
                            className={`font-mono font-bold py-2 px-6 border transition-colors ${
                                timeRemaining <= 0
                                    ? "bg-zinc-700 text-zinc-500 border-zinc-600 cursor-not-allowed"
                                    : "bg-zinc-900 text-red-600 border-red-600 hover:bg-red-600/70 hover:text-zinc-950"
                            }`}
                        >
                            {timeRemaining <= 0 ? "Disconnecting..." : "Cancel"}
                        </button>
                    </div>
                </div>
            </main>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default MatchmakingPage;
