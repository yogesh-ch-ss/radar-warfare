import Header from "../components/Header";
import Footer from "../components/Footer";

const GameLobbyPage = ({ onNavigate, playerId, sessionId, opponentId }) => (
    <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="border-2 border-green-600 max-w-lg w-full bg-zinc-900">
                <div className="bg-zinc-900 p-6 text-center border-b border-green-600">
                    <h2 className="text-2xl font-mono font-bold text-green-500">
                        MATCH FOUND
                    </h2>
                </div>
                <div className="bg-zinc-950 p-6 space-y-4">
                    <div className="border border-green-600 p-4">
                        <h3 className="font-mono text-lg font-bold mb-3 text-green-400">
                            SESSION INFO
                        </h3>
                        <div className="space-y-2 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-green-500">
                                    Player ID:
                                </span>
                                <span className="text-green-400">
                                    {playerId}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-500">
                                    Session ID:
                                </span>
                                <span className="text-green-400">
                                    {sessionId}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-500">
                                    Opponent:
                                </span>
                                <span className="text-green-400">
                                    {opponentId}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="inline-block border border-green-600 bg-zinc-900 p-3 mb-4">
                            <p className="font-mono text-sm text-green-400">
                                WAITING FOR GAME TO START...
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900 p-4 text-center border-t border-green-600">
                    <button
                        onClick={() => onNavigate("home")}
                        className="bg-red-600 text-zinc-950 font-mono font-bold py-2 px-6 border border-red-600 hover:bg-zinc-900 hover:text-red-600 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
        </main>
        <Footer onNavigate={onNavigate} />
    </div>
);

export default GameLobbyPage;
