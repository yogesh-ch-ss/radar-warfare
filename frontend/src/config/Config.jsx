const Config = {
    MATCHMAKING_URL:
        import.meta.env.VITE_MATCHMAKING_URL || "http://localhost:8081",
    GAMEPLAY_URL: import.meta.env.VITE_GAMEPLAY_URL || "http://localhost:8082",
};

export default Config;
