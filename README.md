# Radar Warfare

> [`https://radar-warfare-gamma.vercel.app`](https://radar-warfare-gamma.vercel.app/)

**Radar Warfare** is a web-based multiplayer game designed as a dissertation project for MSc Software Development 2025 at the University of Glasgow. The project explores microservice architecture, real-time communication, and scalable infrastructure within a browser-playable game.

> The presentation video is available at [`https://youtu.be/k6ToBv2GDvg`](https://youtu.be/k6ToBv2GDvg)

> Check Requirements.docx for dependencies

## Deployed version

The deployed version of this application is available at

[`https://radar-warfare-gamma.vercel.app`](https://radar-warfare-gamma.vercel.app/)

### Disclaimer

The application runs on free tier in the deployment platform, and the server shuts down due to inactivity. Before running the application / for troubleshooting, ensure the health of the services via

[`https://radar-warfare-gameplay.onrender.com/health`](https://radar-warfare-gameplay.onrender.com/health)

[`https://radar-warfare-matchmaking.onrender.com/health`](https://radar-warfare-matchmaking.onrender.com/health)

The above webpages must display “**Service is healthy**” message.

## Run locally

1. Download/clone the repository.
2. Ensure that the docker application (daemon) is running in your local system.
3. In the root directory of this project,

    ```bash
    docker compose up -d --build
    ```

4. Open the application on [`http://localhost:3000`](http://localhost:3000/)

## Overview

Radar Warfare demonstrates how modern distributed systems concepts can be applied to real-time multiplayer gaming. Players are automatically matched into pairs, and each pair competes in an independent radar-warfare match.

The system leverages:

-   **Microservices** for matchmaking and gameplay
-   **Redis** for fast in-memory game state management
-   **STOMP over WebSockets** for real-time communication between players and services
-   **Docker** for containerized deployment

## Features

-   Automatic player matchmaking with session management
-   Real-time game updates using WebSockets (STOMP protocol)
-   Scalable architecture supporting multiple independent matches in parallel
-   Redis-backed turn-based gameplay logic with validation and endgame detection
-   Session logging for analysis and persistence

## Architecture

The project follows a **microservices-based architecture**, where each service has a dedicated responsibility. Communication occurs through WebSockets and Redis.

## Technology Stack

**Frontend**

-   React (Vite)
-   Tailwind CSS

**Backend Services - Matchmaking microservice and Gameplay microservice**

-   Spring Boot (Java)
-   WebSocket + STOMP
-   Redis (in-memory DB)

**Infrastructure**

-   Docker (multi-container environment)
-   Docker Compose

## Microservices

1. **Matchmaking Service**
    - Matches players automatically
    - Generates a unique session ID
2. **Gameplay Service**
    - Manages game state in Redis
    - Validates moves and enforces turn order
    - Detects endgame condition
    - Pushes real-time updates to both players
    - Heartbeat monitoring to ensure player connectivity

## Game Flow

1. Player connects via frontend
2. Matchmaking pairs them with an opponent
3. Gameplay service initializes state in Redis
4. Players take turns attacking via WebSocket messages
5. Gameplay service validates moves and updates state
6. Endgame conditio is detected and notified to both clients

## Deployment

The entire system runs in Docker containers.

**To start the project locally:**

```bash
docker compose up -d --build
```

> Ensure that Docker application (daemon) is running in your local system

Containers:

-   `redis`
-   `matchmaking-service`
-   `gameplay-service`
-   `frontend`

## Acknowledgments

-   University of Glasgow MSc Software Development program
