# Scalable E-Commerce Microservices

This repository contains a full-stack e-commerce platform built with microservices architecture. Tech stack (MVP):
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Frontend: React (Vite)

This repo is scaffolded with `backend/` and `frontend/` folders. Follow the `Todo.txt` for implementation steps.

Local dev (after services are implemented):
1. If you ran a previous backend process, stop it first (kill the PID or run `pkill -f "node index.js"` on unix / use Task Manager on Windows).
2. Start MongoDB + services with Docker Compose (recommended for consistent local dev):

```bash
docker compose up -d
```

3. Or run services locally:

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

MongoDB deployment recommendation
- For production / hosted deployments (and to allow other users to use the app) use a managed MongoDB service such as MongoDB Atlas, MongoDB Atlas Free Tier, or providers like Render managed Mongo.
- Store the connection string securely in environment variables (e.g., `MONGO_URI`) in your hosting provider's dashboard.
- Example connection string for Atlas: `mongodb+srv://<user>:<password>@cluster0.xyz.mongodb.net/se?retryWrites=true&w=majority`

Vercel deployment notes
- Vercel is ideal for the frontend (React) and serverless APIs, but it does not host long-running MongoDB instances. Use Vercel for the frontend and a separate host for the backend (Render, Fly, Railway, or Heroku alternatives). Then use MongoDB Atlas for the database.
- Recommended pattern: Frontend on Vercel, Backend on Render/Railway, MongoDB Atlas as DB. Configure `MONGO_URI` in the backend host's env vars.

Port mapping & avoiding conflicts
- Local Docker Compose maps MongoDB to host port `27017:27017` and backend to `5000:5000` (if you have a local node process already listening on 5000 you'll see EADDRINUSE). If you see that error, either stop the local process or change `PORT`.
- To allow other users to connect to a deployed database, use Atlas and invite or create DB users and share configuration docs (do not publish credentials in repo).

Suggested commits are listed in `Todo.txt` for each step.