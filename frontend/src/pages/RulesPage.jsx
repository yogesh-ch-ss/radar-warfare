import Header from "../components/Header";
import Footer from "../components/Footer";

const RulesPage = ({ onNavigate }) => {
    const rules = [
        "Each player receives a 10x10 combat grid",
        "10 defensive installations are randomly deployed",
        "Players alternate launching attack coordinates",
        "Hit installations reduce total defense count",
        "First player to reach 0 defenses loses",
        "Sessions auto-expire after 2 minutes of inactivity",
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="border-2 border-green-600 max-w-lg w-full bg-zinc-900">
                    <div className="bg-zinc-900 text-green-500 p-4 border-b border-green-600">
                        <h2 className="text-xl font-mono font-bold text-center">
                            Rules
                        </h2>
                    </div>
                    <div className="bg-zinc-950 p-6 border-b border-green-600">
                        <ul className="font-mono text-sm leading-relaxed space-y-2">
                            {rules.map((rule, index) => (
                                <li key={index}>• {rule}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-zinc-900 p-4 text-center">
                        <button
                            onClick={() => onNavigate("home")}
                            className="bg-green-500 text-zinc-950 font-mono font-bold py-2 px-6 border border-green-600 hover:bg-zinc-900 hover:text-green-500 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </main>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default RulesPage;
