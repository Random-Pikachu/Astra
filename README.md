<div align="center">

## Astra

Build, scan, and fix repository dependencies. Desktop (Electron) + Web (Vite/React) app with OSV vulnerability scanning, rich visuals, and optional AI-assisted fixes.

</div>

### Features
- Quick repo onboarding with auto-manifest discovery; multi-ecosystem scanning (npm, pip, etc.)
- Privacy-friendly local scanning; only dependency metadata is queried against OSV
- OSV-powered insights with severity normalization, rollups, and per-dependency details
- Visual analytics: overview, stats, and treemap-ready data for at-a-glance risk
- Import location hints via tree-sitter (JavaScript/TypeScript, Python)
- Real-time Fix Console (Socket.IO) streaming steps, commands, warnings, and errors
- AI-assisted code fixes via Gemini CLI; one-click apply, then automatic rescan + DB update
- Robust auth: Email OTP (5‑minute expiry) and Google OAuth
- Desktop + Web: Electron desktop app and Vite-powered web app
- Multi-repo management with search, filters (severity/ecosystem), pagination, and rescans
- Cross-platform support (Windows/macOS/Linux)


### Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), Passport, Nodemailer
- Frontend: React, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion
- Desktop: Electron (preload + context isolation)
- Realtime: Socket.IO
- Scanning: OSV API, tree-sitter (code import detection)

---

### Monorepo Structure (brief)
```
astra/
├─ Backend/
│  ├─ config/          # Passport strategies
│  ├─ controllers/     # Route handlers (repos, dependencies, OTP)
│  ├─ db/              # DB connection
│  ├─ models/          # Mongoose models
│  ├─ routes/          # Express routes
│  ├─ utils/           # OSV, scanning, socket, email, gemini
│  └─ index.js         # Express app entry
└─ Frontend/
   ├─ electron/        # main/preload for Electron
   ├─ src/
   │  ├─ components/   # UI components (modals, dropdowns, etc.)
   │  ├─ pages/        # Dashboard, Dependencies, Details, Auth
   │  ├─ contexts/     # Auth provider
   │  ├─ services/     # API client
   │  └─ store/        # Redux store & slice
   └─ index.html       # Vite entry
```

---

### Getting Started

Prerequisites:
- Node.js 18+ and npm
- MongoDB running and accessible
- Gemini CLI installed and available on PATH (required to use code-fix features)

Clone the repo:
```bash
git clone https://github.com/your-org/astra.git
cd astra
```

#### 1) Backend setup
```bash
cd Backend
npm install
```

Create a .env file in `Backend/`:
```bash
# Mongo
MONGO_URI=mongodb://localhost:27017/astra

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Mail (for OTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_pass
MAIL_FROM="Astra <no-reply@example.com>"
```

Run the backend (nodemon):
```bash
npm run dev
# or
npm start
```

The backend defaults to `http://localhost:3000`.

#### 2) Frontend setup (Web + Electron)
```bash
cd ../Frontend
npm install
```

Run web (Vite) only:
```bash
npm run dev
# Web: http://localhost:5173
```

Run Electron + Vite together (Windows):
```bash
npm start
```

Run Electron on macOS/Linux (alternative):
```bash
# Terminal A
npm run dev

# Terminal B (after Vite is up)
ELECTRON_DEV=1 npx electron .
```

Build web assets:
```bash
npm run build
```

Launch Electron against built assets:
```bash
npm run electron-build
```

Notes:
- Frontend `start` uses `concurrently` and a Windows-style `set` for `ELECTRON_DEV`. On macOS/Linux, prefer the two-terminal approach above or replace `set ELECTRON_DEV=1` with `cross-env ELECTRON_DEV=1`.
- The Electron app expects the backend on `http://localhost:3000`.

---

### Commands Reference

Backend (`Backend/package.json`):
- `npm run dev` – start with nodemon
- `npm start` – start with node

Frontend (`Frontend/package.json`):
- `npm run dev` – Vite dev server
- `npm start` – Vite + Electron (Windows-style env)
- `npm run electron` – wait for Vite then start Electron (Windows-style env)
- `npm run build` – Vite production build
- `npm run electron-build` – start Electron on current directory

---

### Troubleshooting
- Electron does not open on macOS/Linux using `npm start`:
  - Use the two-terminal approach (run Vite, then `ELECTRON_DEV=1 npx electron .`).
  - Or install `cross-env` and change the script to `cross-env ELECTRON_DEV=1`.
- Ports: Backend 3000, Web 5173. Adjust if already in use.

---

### Authors
| GitHub |
| --- |
| [mahil-2040](https://github.com/mahil-2040) |
| [Random-Pikachu](https://github.com/Random-Pikachu) |

---

### License
ISC (see package.json). If you add a dedicated LICENSE file, update this section accordingly.


