import json
import os
from functools import lru_cache

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

try:
    from backend.llm.client import generate_narrative_stream
except Exception as e:
    print("LLM IMPORT ERROR:", e)
    generate_narrative_stream = None

router = APIRouter()

DATA_DIR      = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
REPORTS_DIR   = os.path.join(DATA_DIR, "reports")
COMPANIES_DIR = os.path.join(DATA_DIR, "companies")
SECTOR_FILE   = os.path.join(DATA_DIR, "sector_summary.json")


# ── Internal helpers ──────────────────────────────────────────────────────────

def _load_json(path: str):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def _reports_cache() -> dict[str, dict]:
    reports = {}
    if not os.path.exists(REPORTS_DIR):
        return reports
    for fname in os.listdir(REPORTS_DIR):
        if fname.endswith(".json"):
            data = _load_json(os.path.join(REPORTS_DIR, fname))
            if data and "company_id" in data:
                reports[data["company_id"]] = data
    return reports


def _get_all_reports() -> dict[str, dict]:
    return _reports_cache()


def _find_report(company_id: str) -> dict | None:
    reports = _get_all_reports()
    if company_id in reports:
        return reports[company_id]
    lower = company_id.lower()
    for cid, report in reports.items():
        if cid.lower() == lower:
            return report
    return None


def _build_peer_companies(company_id: str, sector: str, limit: int = 5) -> list[dict]:
    reports = _get_all_reports()
    peers = [
        {
            "name": r["company_name"],
            "sector": r.get("sector", ""),
            "composite_score": r.get("composite_score", 0),
            "fraud_risk": r.get("risk_level", "Low"),
        }
        for cid, r in reports.items()
        if cid != company_id and r.get("sector", "") == sector
    ]
    peers.sort(key=lambda p: p["composite_score"], reverse=True)
    return peers[:limit]


def _build_risk_reasoning(report: dict, beneish: dict, altman: dict, breakdown: dict) -> str:
    parts = []
    m = beneish.get("m_score")
    z = altman.get("z_score")
    if m is not None:
        flag = "above manipulation threshold" if beneish.get("manipulation_likely") else "below manipulation threshold"
        parts.append(f"Beneish M-Score of {m:.2f} ({flag})")
    if z is not None:
        zone = altman.get("zone", "unknown")
        parts.append(f"Altman Z-Score of {z:.2f} ({zone} zone)")
    n_flags = len(report.get("red_flags", []))
    if n_flags:
        parts.append(f"{n_flags} red flag{'s' if n_flags > 1 else ''} detected")
    if not parts:
        return "Insufficient data for detailed reasoning."
    return ". ".join(parts) + "."


def _build_full_report(report: dict, company_id: str) -> dict:
    sector = report.get("sector", "")
    peer_companies = _build_peer_companies(company_id, sector)

    company_raw = _load_json(os.path.join(COMPANIES_DIR, f"{company_id}.json")) or {}
    financial_data = {
        "profit_loss":   company_raw.get("profit_loss", {}),
        "balance_sheet": company_raw.get("balance_sheet", {}),
        "cash_flow":     company_raw.get("cash_flow", {}),
        "ratios":        company_raw.get("ratios", {}),
    }

    sentiment_raw = _load_json(
        os.path.join(DATA_DIR, "reports", f"{company_id}_sentiment.json")
    ) or {}
    sentiment_trend = sentiment_raw.get("sentiment_trend", {})

    rpt_raw = _load_json(os.path.join(DATA_DIR, "rpt", f"{company_id}.json"))
    auditor_raw = _load_json(
        os.path.join(DATA_DIR, "auditor_notes", f"{company_id}.json")
    ) or {}

    breakdown = report.get("breakdown", {})
    beneish   = report.get("beneish", {})
    altman    = report.get("altman", {})
    risk_reasoning = _build_risk_reasoning(report, beneish, altman, breakdown)

    return {
        **report,
        "peer_companies":   peer_companies,
        "financial_data":   financial_data,
        "sentiment_trend":  sentiment_trend,
        "rpt_data":         rpt_raw,
        "auditor_notes":    auditor_raw,
        "risk_reasoning":   risk_reasoning,
        "fraud_risk_score": report.get("risk_level", "Low"),
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/sectors")
def get_sectors():
    data = _load_json(SECTOR_FILE)
    return data or []


@router.get("/sectors/{sector_name}")
def get_sector_companies(sector_name: str):
    reports = _get_all_reports()
    sector_lower = sector_name.replace("%20", " ").lower()

    companies = [
        {
            "company_id":      r["company_id"],
            "company_name":    r["company_name"],
            "sector":          r.get("sector", ""),
            "composite_score": r.get("composite_score", 0),
            "risk_level":      r.get("risk_level", "Low"),
        }
        for r in reports.values()
        if r.get("sector", "").lower() == sector_lower
    ]

    if not companies:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_name}' not found")

    companies.sort(key=lambda c: c["composite_score"], reverse=True)
    return companies


@router.get("/search")
def search_companies(q: str = ""):
    if len(q) < 2:
        return []

    query = q.lower().strip()
    reports = _get_all_reports()
    results = []

    for r in reports.values():
        name   = r.get("company_name", "").lower()
        cid    = r.get("company_id", "").lower()
        sector = r.get("sector", "").lower()

        if query not in name and query not in cid and query not in sector:
            continue

        score = 0
        if name.startswith(query):  score = 3
        elif cid.startswith(query): score = 2
        elif query in name:         score = 1

        results.append({
            "company_id":      r["company_id"],
            "company_name":    r["company_name"],
            "sector":          r.get("sector", ""),
            "composite_score": r.get("composite_score"),
            "risk_level":      r.get("risk_level", "Low"),
            "_score":          score,
        })

    results.sort(key=lambda x: (-x["_score"], x["company_name"]))
    for r in results:
        del r["_score"]
    return results[:10]


@router.get("/report/{company_id}")
def get_report(company_id: str):
    report = _find_report(company_id)

    if report is None:
        reports = _get_all_reports()
        suggestions = [
            {"company_id": r["company_id"], "company_name": r["company_name"]}
            for r in list(reports.values())[:5]
        ]
        raise HTTPException(
            status_code=404,
            detail={"message": f"Company '{company_id}' not found", "suggestions": suggestions},
        )

    resolved_id = report["company_id"]
    return _build_full_report(report, resolved_id)


@router.get("/stream/{company_id}")
def stream_narrative(company_id: str):
    """Streaming disabled — returns cached narrative as plain JSON."""
    report = _find_report(company_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"narrative": report.get("narrative", "No narrative available")}
