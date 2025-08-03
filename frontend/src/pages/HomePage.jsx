import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = ({ onNavigate }) => (
    <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="border-2 border-green-600 max-w-md w-full bg-zinc-950">
                <div className="bg-zinc-950 p-6 text-center border-b border-green-600">
                    <h2 className="text-2xl font-mono font-bold">
                        Radar Warfare
                    </h2>
                </div>
                <div className="bg-zinc-900 p-6 space-y-4 flex flex-col items-center justify-center align-middle">
                    <button
                        onClick={() => onNavigate("matchmaking")}
                        className="w-3/4 bg-green-500 text-zinc-950 font-mono font-bold py-3 px-6 border border-green-600 hover:bg-zinc-950/50 hover:text-green-500 transition-colors"
                    >
                        CONNECT AND PLAY
                    </button>

                    <button
                        onClick={() => onNavigate("rules")}
                        className="w-1/4 bg-zinc-900 text-green-500 font-mono font-bold py-2 px-6 border border-green-600 hover:bg-green-500/50 hover:text-zinc-950 transition-colors"
                    >
                        Rules
                    </button>
                </div>
            </div>
        </main>
        <Footer onNavigate={onNavigate} />
    </div>
);

export default HomePage;
