# MERN Chess Application

A production-ready, real-time multiplayer Chess application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

## Features
- **Real-time Multiplayer**: Play against other users with instant move updates via Socket.IO.
- **Chess Engine**: Server-side rule validation, move legality checking, and game state management.
- **Bots**: Play against bots of varying difficulty (Random, Minimax, Stockfish).
- **Authentication**: Secure JWT-based signup and login.
- **Game History**: Review past games, export PGNs.
- **Responsive UI**: Modern, beautiful interface built with React and Tailwind CSS.

## Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (optional, for containerized run)
- MongoDB (if running locally without Docker)

## Getting Started

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd anti-chess
\`\`\`

### 2. Environment Setup
Copy the example environment file:
\`\`\`bash
cp .env.example .env
\`\`\`
*Note: You may need to create separate `.env` files in `server/` and `client/` if running without Docker, or just ensure the variables are set.*

### 3. Run with Docker (Recommended)
The easiest way to run the full stack (Server, Client, MongoDB) is with Docker Compose.
\`\`\`bash
docker-compose up --build
\`\`\`
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

### 4. Run Locally (Manual)

#### Backend
\`\`\`bash
cd server
npm install
# Ensure MongoDB is running locally on port 27017
npm run dev
\`\`\`

#### Frontend
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

## Testing
### Backend Tests
\`\`\`bash
cd server
npm test
\`\`\`

### Frontend Tests
\`\`\`bash
cd client
npm test
\`\`\`

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, react-chessboard
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Mongoose
- **Database**: MongoDB
- **Chess Logic**: chess.js, stockfish
- **DevOps**: Docker, Docker Compose
