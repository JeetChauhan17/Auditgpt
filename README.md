# AuditGPT

> **NSE Forensic Intelligence Engine** — quantitative fraud detection for Indian equity markets, powered by Beneish M-Score, Altman Z-Score, industry-adjusted anomaly detection, and Gemini LLM narrative synthesis.

Built for **IAR Udaan Hackathon 2026 · Day 3 · Problem #01** · Solo · 30 hours · React + Express (Node.js)

---

## What It Does

Input a company name → AuditGPT fetches 10 years of NSE financial data → runs four forensic models simultaneously → outputs a composite fraud risk score (0–100), an anomaly heatmap, a red flag timeline, peer sector comparison, sentiment trend, and an LLM forensic narrative. Every signal is benchmarked against industry peers, not just absolute thresholds.

---

## Live Demo Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Marketing page with live demo strip and model overview |
| `/radar` | Fraud Radar | Sector grid sorted by risk · search · company drill-down panel |
| `/report/:id` | Forensic Report | Full dashboard for a single company |
| `/critical` | Critical Section | NSE-wide threat matrix heatmap + contagion splash zone |
| `/satyam` | Satyam Case Study | Year-by-year reconstruction of India's largest corporate fraud (2000–2009) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + React Router DOM |
| Backend | Express (Node.js) with `server.ts` serving endpoints on port 3000 |
| Bot | Telegram Bot (`bot.ts`) for mobile queries |
| LLM | Google Gemini 1.5 Pro |
| Data | Pre-cached JSON files (Screener.in format) in `Auditgpt-main/backend/data` |
| UI/Styles | Tailwind CSS + Custom CSS + inline styles |
| Fonts | JetBrains Mono · Space Grotesk |

**Design system:** Bloomberg Terminal dark — `#070b12` background, `#00ff88` green, `#ffb020` amber, `#ff4455` red, `#00d4ff` cyan.

---

## Project Structure

```
.
├── server.ts                  # Express server for API + Vite static serving
├── bot.ts                     # Telegram bot implementation
├── Auditgpt-main/
│   └── backend/
│       └── data/              # Cached NSE financial data, sentiments, sector logic
├── src/
│   ├── components/            # Reusable UI (Navbar, SatyamReplaySection, etc.)
│   ├── pages/
│   │   ├── Home.jsx           # Landing page
│   │   ├── FraudRadar.jsx     # Sector grid + search + company panel
│   │   ├── Report.jsx         # Full forensic report dashboard
│   │   ├── CriticalSection.jsx# NSE-wide threat matrix
│   │   └── SatyamPage.jsx     # Satyam case study page wrapper
│   ├── App.jsx                # Routes
│   └── main.tsx               # Client entry point
├── package.json               # Node.js dependencies
└── vite.config.ts             # Vite build configuration
```

---

## Detection Models

### Composite Score Weights

| Model | Weight | What It Detects | Normalization |
|---|---|---|---|
| Beneish M-Score | 35% | Earnings manipulation via 8 accrual variables | `min(max((M+3)/5×100, 0), 100)` |
| Altman Z-Score | 30% | Financial distress / bankruptcy risk | `min(max((4−Z)/4×100, 0), 100)` |
| Industry-Adjusted Z | 25% | Peer-relative ratio outliers (12 ratios) | `min((avg_abs_z/3)×100, 100)` |
| Trend Breaks | 10% | Structural breaks in financial time series | `(break_count/12)×100` |

**Risk thresholds:** 0–25 Low · 26–50 Medium · 51–75 High · 76–100 Critical

### Beneish M-Score Variables
DSRI · SGI · GMI · AQI · SGI · DEPI · SGAI · TATA · LVGI — all 8 variables decomposed individually, charted over time, and compared against the −1.78 manipulation threshold.

### Altman Z-Score Zones
- **Safe zone:** Z > 2.99
- **Grey zone:** 1.81 < Z < 2.99
- **Distress zone:** Z < 1.81

---

## API Reference

```
GET  /api/sectors                  → Sector summary sorted by avg risk score desc
GET  /api/sectors/{sector_name}    → All companies in sector sorted by risk desc
GET  /api/search?q={query}         → Fuzzy search, returns top 10 matches
GET  /api/report/{company_id}      → Full ForensicReport (scores + peers + financials + sentiment)
GET  /api/stream/{company_id}      → Narrative retrieval
```

---

## Getting Started

### Prerequisites

- Node.js 18+

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

```bash
# .env
VITE_API_URL=/api
TELEGRAM_BOT_TOKEN=your_bot_token  # For Telegram bot
```

### 3. Run Development Server

```bash
npm run dev
```

The application (both frontend and API) will run on `http://localhost:3000`.

---

## License

MIT — built for hackathon purposes. Not financial advice. Do not use as the sole basis for investment decisions.

---

*AuditGPT · NSE Forensic Intelligence · FY2026 · IAR Udaan Hackathon*
