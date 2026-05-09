# TODOS

## P2: PDF Report Export
Generate a downloadable PDF forensic report with fraud score, anomaly map, red flag timeline, peer comparison, and LLM narrative. Uses reportlab (Python) or react-pdf.
- **Why:** Tangible deliverable for judges. Shows production readiness.
- **Effort:** M (human ~1 day / CC ~2 hours)
- **Depends on:** All core dashboard components working.
- **Source:** CEO review 2026-03-24

## P3: Benford's Law Analysis
Detect data fabrication via first-digit distribution analysis across financial line items.
- **Why:** Powerful forensic technique, but requires granular line-item data not available from Screener.in.
- **Effort:** M (human ~1 day / CC ~2 hours)
- **Depends on:** Annual report PDF parsing pipeline (line-item extraction).
- **Source:** CEO review 2026-03-24
