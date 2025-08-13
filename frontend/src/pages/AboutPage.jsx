import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutPage = ({ onNavigate }) => (
    <div className="min-h-screen bg-zinc-950 text-green-500 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="border-2 border-green-600 max-w-lg w-full bg-zinc-900">
                <div className="bg-zinc-900 text-green-500 p-4 border-b border-green-600">
                    <h2 className="text-xl font-mono font-bold text-center">
                        About
                    </h2>
                </div>
                <div className="bg-zinc-950 p-6 border-b border-green-600 font-mono leading-relaxed flex flex-col justify-center items-center text-center">
                    <p className="text-base">
                        Developed by Yogesh Chandra Singh Samant for MSc
                        Software Development dissertation project at University
                        of Glasgow.
                    </p>
                    <p className="pt-4 text-sm">Technologies Used:</p>
                    <p className="text-sm">
                        Microservices, Spring Boot, React, Redis, Websockets.
                    </p>
                    <button
                        className="mt-4 px-4 py-2 text-sm bg-green-500 text-zinc-950 font-mono font-bold border border-green-600 hover:bg-zinc-900 hover:text-green-500 transition-colors focus:outline-none"
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

export default AboutPage;
