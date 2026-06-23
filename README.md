# Hero Cycles Pricing Engine

A full-stack pricing engine for Hero Cycles that allows salespersons to manage cycle configurations, parts, and instantly get total prices broken down by component.

## Tech Stack

- **Backend:** Node.js + Express + SQLite (via better-sqlite3)
- **Frontend:** React + Vite + Tailwind CSS
- **Testing:** Vitest (backend unit tests)

## Project Structure

```
hero-cycles-pricing-engine/
├── docs/                    # Documentation
│   ├── PROBLEM_BREAKDOWN.md # Part 1 — Questions, assumptions, use cases
│   ├── PSEUDOCODE.md        # Pseudocode for Part 2
│   ├── DESIGN.md            # Part 3 — Design sensibility & UI wireframes
│   └── PROMPTS.md           # AI prompts used during development
├── backend/                 # Express API server
│   ├── src/
│   │   ├── index.js         # Entry point
│   │   ├── db.js            # Database setup & seed
│   │   ├── routes/          # API routes
│   │   └── models/          # Data access layer
│   ├── tests/               # Unit tests
│   └── package.json
├── frontend/                # React UI
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── api/             # API client
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation & Run

```bash
# Clone the repository
git clone <repo-url>
cd hero-cycles-pricing-engine

# Install & start backend (runs on port 3001)
cd backend
npm install
npm run seed   # Seeds the database with sample data
npm start

# In a new terminal — Install & start frontend (runs on port 5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Running Tests

```bash
cd backend
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/parts | List all parts (filterable by category) |
| POST | /api/parts | Create a new part |
| PUT | /api/parts/:id | Update a part (including price) |
| DELETE | /api/parts/:id | Delete a part |
| GET | /api/configurations | List all cycle configurations |
| POST | /api/configurations | Create a new configuration |
| GET | /api/configurations/:id | Get configuration with price breakdown |
| PUT | /api/configurations/:id | Update a configuration |
| DELETE | /api/configurations/:id | Delete a configuration |

## Features

- **Parts Management:** Add, edit, delete parts with category and pricing
- **Configuration Builder:** Create cycle configurations by selecting parts from each category
- **Instant Pricing:** Real-time total price calculation with component breakdown
- **Price History:** Track when part prices change over time
- **Search & Filter:** Find parts and configurations quickly
