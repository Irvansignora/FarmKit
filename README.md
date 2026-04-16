# 🌾 FarmKit — Node.js Farm Management App

A production-ready, multilingual farm management system built with **Node.js + Express**.  
Supports **Indonesian 🇮🇩 · English 🇬🇧 · Japanese 🇯🇵** — switchable in one click.

---

## Project Structure

```
farmkit/
├── server.js              ← Express app entry point
├── package.json
├── vercel.json            ← Vercel deployment config
├── .env.example           ← Environment variable template
├── .gitignore
│
├── data/
│   └── store.js           ← In-memory data store + CRUD (swap with DB later)
│
├── middleware/
│   └── validate.js        ← Input validation & sanitization
│
├── routes/
│   └── api.js             ← REST API: /api/* endpoints
│
├── views/
│   └── index.html         ← SPA HTML served by Express
│
└── public/
    ├── css/
    │   └── style.css      ← All styles
    └── js/
        ├── i18n.js        ← Translation engine (ID/EN/JP)
        ├── render.js      ← DOM rendering from API data
        └── app.js         ← App controller, API calls, event handlers
```

---

## Security Features

| Layer | What it does |
|-------|-------------|
| **Helmet.js** | Sets 11 secure HTTP headers (CSP, HSTS, etc.) |
| **CORS** | Whitelist-based origin control |
| **Rate Limiting** | 200 req/15min globally, 30 req/min on write endpoints |
| **Input Validation** | Server-side validation on every POST/PUT |
| **Input Sanitization** | Strips `<>` from all string inputs, 200 char limit |
| **Body size limit** | Max 50kb per request |
| **Express static** | Files served with proper cache headers |
| **Error handler** | Hides stack traces in production |

---

## REST API Endpoints

```
GET    /api/health          Health check
GET    /api/dashboard       Summary stats

GET    /api/workers         List workers
POST   /api/workers         Add worker
PUT    /api/workers/:id     Update worker
DELETE /api/workers/:id     Delete worker

GET    /api/attendance      List attendance records
POST   /api/attendance      Add attendance record

GET    /api/tasks           Get tasks grouped by column (todo/doing/done)
POST   /api/tasks           Create task
PATCH  /api/tasks/:id/move  Move task to column
DELETE /api/tasks/:id       Delete task

GET    /api/payroll         List payroll records
PATCH  /api/payroll/:id/status  Mark paid/pending

GET    /api/harvests        List harvest records
POST   /api/harvests        Add harvest record

GET    /api/inventory       List inventory items
POST   /api/inventory       Add inventory item
PUT    /api/inventory/:id   Update inventory item

GET    /api/finances        List finance transactions
POST   /api/finances        Add transaction

GET    /api/crops           List active crops
GET    /api/harvest-chart   7-day harvest chart data
```

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Run in development (with auto-reload)
npm run dev

# 4. Or run in production mode
NODE_ENV=production npm start
```

App will be available at **http://localhost:3000**

---

## Deploy to Vercel

### Option 1: CLI (fastest)
```bash
npm install -g vercel
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Framework: **Other** (Node.js is auto-detected via `server.js`)
4. Add environment variable: `NODE_ENV = production`
5. Add `ALLOWED_ORIGINS = https://your-vercel-domain.vercel.app`
6. Click **Deploy**

---

## Deploy to Railway / Render / Fly.io

```bash
# Railway
railway up

# Render — connect GitHub, set:
#   Build: npm install
#   Start: npm start

# Fly.io
fly launch
fly deploy
```

---

## Deploy to a VPS (Ubuntu/Debian)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and setup
git clone https://github.com/youruser/farmkit.git
cd farmkit
npm install --production
cp .env.example .env
nano .env  # set NODE_ENV=production, ALLOWED_ORIGINS

# Run with PM2
npm install -g pm2
pm2 start server.js --name farmkit
pm2 startup
pm2 save

# Nginx reverse proxy (optional)
# proxy_pass http://localhost:3000;
```

---

## Upgrade to Real Database

The data layer is isolated in `data/store.js`. To switch to PostgreSQL:

```js
// data/store.js — replace in-memory arrays with DB queries
// e.g. using 'pg' or 'prisma'

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const getWorkers = async () => {
  const { rows } = await pool.query('SELECT * FROM workers ORDER BY id');
  return rows;
};
// etc.
```

All API routes stay the same — zero frontend changes needed.

---

## Language Support

Click language buttons in the sidebar:
- 🇮🇩 **ID** — Bahasa Indonesia (default)
- 🇬🇧 **EN** — English
- 🇯🇵 **日本語** — Japanese

All UI text switches instantly via the `I18n` module (`public/js/i18n.js`).

---

MIT License
