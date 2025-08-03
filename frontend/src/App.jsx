import { useState } from "react";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import RulesPage from "./pages/RulesPage";

export default function App() {
    const [currentPage, setCurrentPage] = useState("home");

    const navigate = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case "home":
                return <HomePage onNavigate={navigate} />;
            case "about":
                return <AboutPage onNavigate={navigate} />;
            case "rules":
                return <RulesPage onNavigate={navigate} />;
            case "matchmaking":
                return <MatchmakingPage onNavigate={navigate} />;
            default:
                return <HomePage onNavigate={navigate} />;
        }
    };

    return <div className="font-mono">{renderPage()}</div>;
}
