# 🏆 Live Score Update App

A full-stack, real-time sports score tracking application built with **React**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB**, completely typed with **TypeScript**.

The repository is structured as a monorepo containing both the backend API server and the frontend client application.

---

## 📌 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Client Setup](#3-frontend-client-setup)
- [Default Credentials](#-default-credentials)
- [API & WebSocket Overview](#-api--websocket-overview)
  - [REST API Endpoints](#rest-api-endpoints)
  - [Socket.IO Events](#socketio-events)
- [Scripts Reference](#-scripts-reference)
- [License](#-license)

---

## 🚀 Overview & Architecture

This application enables real-time score updates for matches (Football and Basketball) using room-based WebSocket connections:

1. **Admins** manage matches (create match, adjust scores, change status between `upcoming`, `live`, and `finished`). Every score update is emitted via Socket.IO directly to the corresponding match room.
2. **Viewers** can view match lists and join dedicated live match rooms to watch real-time score updates and status shifts with zero page refresh.

---

## ✨ Key Features

- **⚡ Real-Time Synchronization**: Instant live score propagation powered by Socket.IO rooms.
- **🔐 Authentication & RBAC**: JWT-based authentication with role-based access control (`admin` and `viewer`).
- **🛡️ Protected Routes**: Automatic client-side redirection and route guarding based on auth status and user role.
- **⚽ Multi-Sport Support**: Tailored for Football and Basketball games with team-level scoring.
- **🌱 Built-in Database Seeder**: Single-command admin seeding script to jumpstart development.

---

## 🛠️ Tech Stack

### Backend (`/backend`)
- **Runtime & Language**: Node.js & TypeScript
- **Framework**: Express 5
- **Realtime**: Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Auth & Security**: JSON Web Tokens (JWT), bcryptjs, CORS
- **Dev Runner**: tsx (TypeScript execute with hot-reloading)

### Frontend (`/score-client`)
- **Framework & Tooling**: React 18 with Vite
- **Language**: TypeScript
- **Routing**: React Router DOM (v7)
- **Realtime Client**: Socket.IO Client
- **Styling**: Vanilla CSS with modern layout styling

---

## 📁 Project Structure

```text
live_score_update/
├── package.json             # Root monorepo scripts (concurrent dev & build)
├── .gitignore               # Unified root gitignore for monorepo
├── README.md                # Project documentation
├── backend/
│   ├── .env.example         # Environment template
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts         # Server entrypoint & HTTP server
│       ├── db.ts            # MongoDB connection
│       ├── seed.ts          # Admin seeding script
│       ├── middleware/      # JWT authentication & admin role guard
│       ├── models/          # Mongoose models (User, Match)
│       ├── routes/          # Express REST routes (authRoutes, matchRoutes)
│       └── socket/          # Socket.IO connection & event handlers
└── score-client/
    ├── index.html
    ├── package.json
    ├── pnpm-lock.yaml
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx         # React app bootstrap
        ├── App.tsx          # Application routing & layout
        ├── api.ts           # Axios / fetch API client configuration
        ├── context/         # AuthContext provider
        ├── components/      # Shared components (ProtectedRoute, etc.)
        ├── pages/           # Pages (Login, Register)
        │   ├── admin/       # Admin Dashboard & MatchControl
        │   └── viewer/      # Viewer MatchList & Scoreboard
        └── socket/          # Socket client instance & hooks
```

---

## 📋 Prerequisites

Before running the application, make sure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (port `27017`) or a MongoDB Atlas connection URI
- [pnpm](https://pnpm.io/) (preferred) or `npm` / `yarn`

---

## ⚡ Quick Start: Run Everything in Parallel from Root

You can run both the **backend** and **frontend** simultaneously from the repository root using a single command:

1. **Install root & workspace dependencies**:
   ```bash
   # From root:
   pnpm install
   cd backend && pnpm install && cd ../score-client && pnpm install && cd ..
   ```

2. **Configure Backend Environment**:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Seed Database** (Run once from root):
   ```bash
   pnpm run seed
   ```

4. **Start Both Applications in Parallel**:
   ```bash
   pnpm run dev
   # or: npm run dev
   ```

> 🎯 **Guaranteed Startup Order:** The script starts the backend first. Using `wait-on tcp:5000`, the frontend client automatically pauses and waits until the backend has successfully connected to MongoDB and opened its server port on `5000`. Once ready, the Vite client boots up. Both services run in one terminal with color-coded tags (`[backend]` in cyan, `[client]` in magenta). Pressing `Ctrl + C` cleanly terminates both services together.

---

## 🏁 Manual Step-by-Step Setup

If you prefer running services in separate terminals:

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or: npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Inspect and customize values in `.env` if needed:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/live_score
   JWT_SECRET=your_super_secret_jwt_key
   ADMIN_EMAIL=admin@score.com
   ADMIN_PASSWORD=admin123
   ```

4. **Seed the Admin User**:
   Ensure MongoDB is running, then run the seed script to create the initial admin user:
   ```bash
   pnpm run seed
   # or: npm run seed
   ```

5. **Start the Backend Server**:
   ```bash
   pnpm run dev
   # or: npm run dev
   ```
   The backend API will start on **`http://localhost:5000`**.

---

### 2. Frontend Client Setup

Open a new terminal window:

1. **Navigate to the client directory**:
   ```bash
   cd score-client
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or: npm install
   ```

3. **Start the Vite Dev Server**:
   ```bash
   pnpm run dev
   # or: npm run dev
   ```
   The frontend app will start on **`http://localhost:5173`**.

---

## 🔑 Default Credentials

After running `pnpm run seed` in the backend:

| Role | Email | Password | Access / Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@score.com` | `admin123` | Full control (`/admin`) |
| **Viewer** | *Self-register via UI* | *Chosen during signup* | View-only (`/viewer`) |

> 💡 **Note**: Viewers can register directly at `http://localhost:5173/register`.

---

## 📡 API & WebSocket Overview

### REST API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new viewer account.
- `POST /api/auth/login` — Login as admin or viewer (returns JWT token and user profile).

#### Matches (`/api/matches`) *(Requires Bearer Token)*
- `GET /api/matches` — Fetch all matches (viewer & admin).
- `GET /api/matches/:id` — Fetch match details by ID.
- `POST /api/matches` — Create a new match (*admin only*).
- `PATCH /api/matches/:id/score` — Update score and emit update (*admin only*).
- `PATCH /api/matches/:id/status` — Update match status (`upcoming` \| `live` \| `finished`) (*admin only*).
- `DELETE /api/matches/:id` — Delete a match (*admin only*).

---

### Socket.IO Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `matchId: string` | Joins the socket room for a specific match. |
| `send:match:update` | Client ➔ Server | `{ roomId, ...matchData }` | Emitted by admin when updating match scores/state. |
| `match-update` | Server ➔ Client | Updated match data | Broadcasted to everyone in that match room. |
| `match:deleted` | Server ➔ Client | Deleted match object | Broadcasted globally when an admin deletes a match. |

---

## 📜 Scripts Reference

### Root Directory (`/`)
- `pnpm run dev`: Runs **both** backend and frontend concurrently in a single terminal with colored logs (`--kill-others` enabled).
- `pnpm run dev:npm`: Runs both using npm `--prefix` if pnpm is not preferred.
- `pnpm run dev:backend`: Starts only the backend dev server from root.
- `pnpm run dev:client`: Starts only the frontend client dev server from root.
- `pnpm run seed`: Runs the database seed script for the backend from root.
- `pnpm run build`: Concurrently builds production bundles for both projects.

### Backend (`/backend`)
- `pnpm run dev`: Starts backend development server with hot-reload via `tsx`.
- `pnpm run seed`: Seeds/updates the admin credentials in MongoDB.
- `pnpm run build`: Compiles TypeScript to JavaScript into `dist/`.
- `pnpm run start`: Runs compiled production code from `dist/index.js`.

### Client (`/score-client`)
- `pnpm run dev`: Starts the Vite development server with HMR.
- `pnpm run build`: Type-checks and creates an optimized production bundle in `dist/`.
- `pnpm run preview`: Locally previews the production build.
- `pnpm run lint`: Runs ESLint across the client code.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

