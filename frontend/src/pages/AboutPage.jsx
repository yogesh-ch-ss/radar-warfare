import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutPage = ({ onNavigate }) => (
    <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="border-2 border-green-600 max-w-2xl w-full bg-zinc-900">
                {/* Header Section */}
                <div className="bg-zinc-900 text-green-500 p-6 border-b border-green-600 text-center">
                    <h2 className="text-2xl font-mono font-bold mb-2">
                        About Radar Warfare
                    </h2>
                </div>

                {/* Main Content */}
                <div className="bg-zinc-950 p-8">
                    {/* Project Description */}
                    <div className="mb-8 text-center">
                        <p className="font-mono text-sm leading-relaxed mb-4">
                            A real-time multiplayer strategy game developed for
                            MSc Software Development dissertation project 2025
                            at the University of Glasgow.
                        </p>
                        <p className="font-mono text-sm leading-relaxed mb-4">
                            Built on the principles of distributed systems using
                            Spring Boot for backend microservices, React for
                            frontend, in-memory Redis database for fast-cached
                            read/write operations, and WebSockets for real-time
                            connection.
                        </p>
                    </div>

                    {/* Developer Section */}
                    <div className="border border-green-600 bg-zinc-900 p-6">
                        <div className="text-center">
                            <h3 className="font-mono text-sm font-bold text-green-400 mb-2">
                                Developed by
                            </h3>
                            <p className="font-mono text-base font-bold text-green-500 mb-2">
                                Yogesh Chandra Singh Samant
                            </p>
                            <p className="font-mono text-sm text-green-400 mb-4">
                                MSc Software Development Graduate - 2025
                                <br />
                                University of Glasgow
                            </p>
                            <button
                                className="bg-green-500 text-zinc-950 font-mono font-bold py-2 px-6 border border-green-600 hover:bg-zinc-900 hover:text-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                                onClick={() =>
                                    window.open(
                                        "https://www.linkedin.com/in/yogesh-chandra-singh-samant/",
                                        "_blank"
                                    )
                                }
                            >
                                Connect on LinkedIn
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 p-6 text-center border-t border-green-600">
                    <button
                        onClick={() => onNavigate("home")}
                        className="bg-green-500 text-zinc-950 font-mono font-bold py-3 px-8 border border-green-600 hover:bg-zinc-900 hover:text-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </main>
        <Footer onNavigate={onNavigate} />
    </div>
);

export default AboutPage;
