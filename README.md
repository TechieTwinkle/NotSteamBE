# notSteam - Steam x itch.io x Wikipedia for Games

notSteam is a production-ready MERN application where indie developers publish deployed game links and players discover, rate, and discuss games with rich, Wikipedia-style documentation.

## Tech Stack
- **Frontend:** React (Vite), TailwindCSS, Framer Motion, Zustand
- **Backend:** Node.js, Express, Mongoose
- **Auth:** JWT (role-based: developer/player), Google OAuth
- **Database:** MongoDB

## Folder Structure
```txt
NotSteam-Wikipedia-Of-Game/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      server.js
    scripts/seed.js
    .env.example
  frontend/
    src/
      api/
      components/
      layout/
      pages/
      store/
      utils/
      App.jsx
      main.jsx
    .env.example
```

## Features Implemented
- JWT register/login for **developer** and **player** roles
- Dynamic navbar (search, dashboard, profile state after auth)
- Initial flow: loading screen -> public pages -> join modal
- Home page with hero CTA + dynamic stats
- Discover page with creative animated tiles, search, genre + popularity/new filters
- Game page with:
  - markdown description
  - structured sections: **Overview**, **Gameplay**, **Developer Notes**
  - external play link (deployed links only)
  - 1-5 star ratings
  - direct feedback discussion comments
- Developer dashboard for upload + manage games
- Player/developer profile tabs (bio, games, activity)
- Error handling + loading states across app
- Seed script with demo developer/player accounts and sample game

## Backend API
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Games
- `POST /api/games` (developer only)
- `GET /api/games`
- `GET /api/games/:id`
- `GET /api/games/developer/me` (developer only)
- `DELETE /api/games/:id` (developer only)

### Comments
- `POST /api/comments`
- `GET /api/comments/:gameId`

### Ratings
- `POST /api/ratings`

### Users
- `GET /api/users/me`
- `GET /api/users/:id`

## Setup
### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:5000`.

## Demo Credentials (from seed)
- Developer: `dev@notsteam.dev` / `password123`
- Player: `player@notsteam.dev` / `password123`

## Important Validation Rule
Game uploads are intentionally restricted to **deployed URLs only** (Netlify, Vercel, GitHub Pages, itch.io, etc). Binary/file uploads are not allowed.

## Production Notes
- Set secure values in `backend/.env` (`JWT_SECRET`, `MONGO_URI`, `CLIENT_URL`)
- Configure CORS for your deployed frontend domain
- Serve frontend static build through CDN/host (Vercel/Netlify) and backend via Node host (Render/Railway/Fly)
