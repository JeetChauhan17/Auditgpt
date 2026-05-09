# AuditGPT

Financial statement forensics engine that ingests any NSE-listed company's complete 10-year filing history and generates a fraud risk / financial health report — finding what auditors missed.

## Problem Context

IAR Udaan Hackathon 2026, Day 3 Problem Statement #01 (AI / GenAI / RAG theme).
Solo coder, 30 hours, two non-coding teammates (research/presentation).

## Critical Constraint — Industry-Specific Benchmarking

Every anomaly MUST be benchmarked against industry-specific peer norms. A system that fires the same alerts regardless of industry is an immediate disqualification.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | FastAPI (Python 3.11+) |
| Quant Engine | pandas + numpy + scipy |
| LLM | Google Gemini 1.5 Flash (free tier, 15 RPM, 1M context) |
| Sentiment | VADER (vaderSentiment) |
| Frontend | React + Vite |
| Charts | Recharts |
| Data | JSON files (no database) |
| Theme | Bloomberg Terminal dark (neon green/amber, monospace numbers) |

## Architecture

Two-layer detection engine:
- **Layer 1 (Quantitative):** Beneish M-Score, Altman Z-Score, industry-adjusted z-scores, trend break detection
- **Layer 2 (Qualitative):** Gemini 1.5 Flash with in-context fraud knowledge base (no RAG/vector DB)

Pre-cache 200 companies from Screener.in. Pre-compute all quant scores + LLM responses.

## Composite Fraud Risk Score

| Score | Weight |
|-------|--------|
| Beneish M-Score | 35% |
| Altman Z-Score | 30% |
| Industry-Adjusted Z-Score | 25% |
| Trend Break Count | 10% |

Thresholds: 0-25 Low, 26-50 Medium, 51-75 High, 76-100 Critical.

## Key Features (from CEO review)

- **Fraud Radar Landing Page:** Sector grid cards colored by risk → drill-down to companies → full report
- **Bloomberg Dark Theme:** #0a0e17 background, neon green/amber/red accents, monospace numbers
- **Satyam Replay Animation:** Year slider + auto-advance, progressive heatmap reveal
- **LLM Streaming UI:** SSE from FastAPI, character-by-character narrative rendering
- **Known Fraud Pattern Overlay:** Satyam dotted-line overlay when composite score > 50
- **Hero + Scroll Layout:** FraudScore + AnomalyMap fill viewport, everything else scrolls below

## Frontend Routes

- `/` — Fraud Radar landing (sector grid + search)
- `/report/:companyId` — Full forensic report

## API Endpoints

```
GET /api/sectors          → sector summary with avg risk scores
GET /api/search?q=        → company autocomplete
GET /api/report/:id       → full ForensicReport (quant + peers + timeline + sentiment + RPT)
GET /api/stream/:id       → SSE streaming LLM narrative
```

## Build Phases (30 Hours)

| Phase | Hours | Focus |
|-------|-------|-------|
| 1: Data | 0-4 | Screener.in scraper, cache 200 companies, industry mapping |
| 2: Quant Engine | 4-9 | Beneish, Altman, z-scores, trend breaks, sector summaries |
| 3: LLM + Sentiment | 9-13 | Gemini client + streaming, knowledge base, VADER sentiment |
| 4: API | 13-15 | FastAPI endpoints, Pydantic schemas |
| 5: Frontend Core | 15-21 | Dark theme, Fraud Radar, FraudScore, AnomalyMap, PeerComparison |
| 6: Frontend Extended | 21-26 | Timeline, Sentiment, RPT, NarrativePanel, Satyam Replay, Fraud Overlay |
| 7: Polish | 26-30 | Demo script, edge cases, README, presentation |

## Priority-Ordered Cut List (if behind schedule)

Cut from bottom up: Known Fraud Overlay → Satyam Replay → Fraud Radar (revert to SearchBar) → NarrativePanel streaming → RPTChart. NEVER cut: FraudScore, AnomalyMap, PeerComparison, RedFlagTimeline, SentimentTrend, Dark Theme.

## Commands

```bash
# Backend
cd backend && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# Pre-cache data
python scripts/fetch_data.py
python scripts/precompute.py
```

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.

## Design Documents

- Design system: DESIGN.md
- Design doc: ~/.gstack/projects/AuditGPT/jj-unknown-design-20260324-153000.md
- CEO plan: ~/.gstack/projects/AuditGPT/ceo-plans/2026-03-24-auditgpt-hackathon.md
