# Team Project Manager — Development README

This repository contains a backend (Node + Express + TypeScript + MongoDB) and a frontend (Vite + React + TypeScript + Tailwind) for a simple Team Project Manager app.

This README explains how to run the backend and frontend locally on Windows (PowerShell), how to access the API documentation (Swagger), and quick tips to test the app (including sockets and basic troubleshooting).

---

## Prerequisites

- Node.js (recommended 18.x or later) and npm installed. Check with:

```powershell
node --version
npm --version
```

- A running MongoDB instance (local or cloud). You can use MongoDB Atlas.

- Recommended editors: VS Code.

---

## Repository layout

- `backend/` — Node + Express + TypeScript backend
- `frontend/` — Vite + React + TypeScript frontend

---

## Backend — setup & run (development)

Open a terminal and run these steps from the repository root.

1. Install dependencies and configure env (once):

```powershell
cd backend
npm install
```

2. Create a `.env` file in `backend/` (copy from `.env.example` if present) with at least the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=some_long_random_secret
FRONTEND_URL=http://localhost:5173
```

3. Start the backend in development mode (uses `ts-node`/`nodemon`):

```powershell
npm run dev
```

- The backend will listen on port 5000 by default.
- Swagger UI (API docs) will be available at: `http://localhost:5000/api-docs/`
- Health check: `http://localhost:5000/` will return a small JSON message.

Notes:
- If `npm run dev` fails due to missing types or packages, run `npm install` again inside `backend/`.
- When the server is running, you will see logs printed to the terminal (including socket connection logs if clients connect).

---

## Using Swagger to test APIs

1. With the backend running, open:

```
http://localhost:5000/api-docs/
```

2. The Swagger UI lists all endpoints (Users, Projects, Tasks). You can use the UI to:
- Register a user (`POST /api/users/register`) — create an account and receive a JWT token in the response.
- Log in (`POST /api/users/login`) — save the returned token for use in the frontend (the frontend stores token in localStorage on login).
- Try project and task endpoints directly from Swagger. When testing protected endpoints from Swagger you may need to add the `Bearer <token>` value in the Authorize button.

---

## Frontend — setup & run (development)

Open a second terminal and run these steps from the repository root.

1. Install frontend dependencies (once):

```powershell
cd frontend
npm install
```

2. Start the Vite dev server:

```powershell
npm run dev
```

3. Open the app in a browser (Vite default):

```
http://localhost:5173
```

Notes:
- The frontend is configured to use `http://localhost:5000/api` as the API base URL (see `frontend/src/services/api.ts`).
- On successful login the frontend stores the JWT token in `localStorage` and sends it automatically in the `Authorization: Bearer <token>` header for subsequent API requests.

---

## Quick end-to-end test flow

1. Start backend (`npm run dev`) and frontend (`npm run dev`).
2. Open the frontend in your browser: `http://localhost:5173`.
3. Register a new user or login using the frontend or via Swagger.
4. Create a project (Frontend `Create Project` page). Note: the members input expects existing user _IDs_ (Mongo ObjectId) for now; if you want to provide emails you can use the backend API via Swagger (or I can add email-to-id resolution on the backend).
5. View the project list; open a project to add tasks.
6. Create a task inside the Project Details page — if sockets are connected, other clients in the same project room will receive real-time `task:created` events.

---

## Real-time (Socket.IO)

- The backend initializes Socket.IO and listens for clients to join project rooms (room name format: `project:<projectId>`).
- The frontend connects to `http://localhost:5000` (socket client) and will emit `join`/`leave` to subscribe to project updates.
- You can watch socket logs on the backend terminal — they will show connect and disconnect messages.

Troubleshooting socket disconnects:
- Ensure frontend runs at the origin allowed by `FRONTEND_URL` in the backend `.env` (default `http://localhost:5173`).
- Check browser console → Network tab for `/socket.io/` requests and any CORS or 4xx/5xx responses.

---

## Common troubleshooting

- "400 Bad Request" when creating a project:
  - If you enter email addresses in the Members field, the backend currently expects user IDs (ObjectId). Enter a blank members field or valid user IDs, or add members later via the API.
  - Alternatively, use Swagger to register users first and then add members by userId.

- "404 Not Found - /api/projects" spam:
  - The frontend used to call GET /api/projects automatically. Make sure backend is running and the new `GET /api/projects` endpoint exists (it does in this repo now). If not, update backend and restart.

- TypeScript or editor errors in VS Code about missing React types:
  - Make sure `npm install` has been run inside `frontend/` and `backend/` to install dev dependencies and type packages.

---

## Useful commands recap (PowerShell)

Backend:

```powershell
cd backend
npm install          # install deps
npm run dev          # start dev server (nodemon + ts-node)
npm run build        # compile TypeScript to dist/
npm start            # run compiled JS from dist/
```

Frontend:

```powershell
cd frontend
npm install
npm run dev          # start Vite dev server (open http://localhost:5173)
npm run build        # build production assets
npm run preview      # preview built app (optional)
```

Open Swagger UI:

```
http://localhost:5000/api-docs/
```

Open Frontend UI:

```
http://localhost:5173
```

---


