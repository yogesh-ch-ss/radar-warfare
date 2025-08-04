import Header from "../components/Header";
import Footer from "../components/Footer";

const MatchmakingPage = ({ onNavigate, playerId, onCancel }) => (
    <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="border-2 border-green-600 max-w-md w-full bg-zinc-900">
                <div className="bg-zinc-900 p-6 flex flex-col items-center justify-center align-middle">
                    <h2 className="text-xl font-mono font-bold text-center mb-4">
                        Finding Match...
                    </h2>
                    <div className="bg-zinc-950 border border-green-600 p-3 mb-6 w-full">
                        <p className="font-mono text-xs text-center text-green-400">
                            PLAYER ID: {playerId}
                        </p>
                    </div>
                    <div className="flex justify-center mb-6">
                        <span className="relative flex size-10 align-middle justify-center items-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex size-1 rounded-full bg-green-500"></span>
                        </span>
                    </div>
                    <p className="font-mono text-sm text-center mb-6">
                        SCANNING FOR AVAILABLE OPPONENT...
                    </p>
                    <button
                        onClick={onCancel}
                        className="bg-zinc-900 text-red-600 font-mono font-bold py-2 px-6 border border-red-600 hover:bg-red-600/70 hover:text-zinc-950 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </main>
        <Footer onNavigate={onNavigate} />
    </div>
);

export default MatchmakingPage;
