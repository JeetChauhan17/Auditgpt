"""
Pre-computes all quantitative scores, sector summaries, and optionally
LLM responses for cached companies. Run after fetch_data.py.

Usage:
  python scripts/precompute.py              # Quant only (fast)
  python scripts/precompute.py --with-llm   # Quant + LLM narratives
"""

import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data.ingestion import load_cached_companies, get_sector_peers
from backend.engine.scoring import score_company
from backend.engine.sentiment import generate_proxy_sentiment
from backend.llm.client import generate_narrative

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "data")
REPORTS_DIR = os.path.join(DATA_DIR, "reports")
SECTOR_SUMMARY_FILE = os.path.join(DATA_DIR, "sector_summary.json")


def main():
    with_llm = "--with-llm" in sys.argv

    companies = load_cached_companies()
    if not companies:
        print("No cached companies found. Run fetch_data.py first.")
        return

    print(f"Pre-computing scores for {len(companies)} companies...")
    os.makedirs(REPORTS_DIR, exist_ok=True)

    reports = []
    sector_scores = {}

    for i, company in enumerate(companies):
        cid = company.get("company_id", "unknown")
        name = company.get("company_name", "Unknown")
        sector = company.get("sector", "Unknown")

        print(f"  [{i+1}/{len(companies)}] {name}...")

        # Get peers
        peers = get_sector_peers(cid, sector, companies, top_n=5)

        # Score
        scores = score_company(company, peers)

        # Sentiment
        sentiment = generate_proxy_sentiment(company)

        # Build report
        report = {
            "company_id": cid,
            "company_name": name,
            "sector": sector,
            "composite_score": scores["composite_score"],
            "risk_level": scores["risk_level"],
            "beneish": scores["beneish"],
            "altman": scores["altman"],
            "anomaly_map": scores["anomaly_map"],
            "trend_breaks": scores["trend_breaks"],
            "red_flags": scores["red_flags"],
            "breakdown": scores["breakdown"],
            "sentiment_trend": sentiment,
            "peer_companies": [
                {
                    "name": p.get("company_name", ""),
                    "sector": p.get("sector", ""),
                    "composite_score": 0,  # Will be filled in second pass
                    "fraud_risk": "Unknown",
                }
                for p in peers[:5]
            ],
            "financial_data": {
                "profit_loss": company.get("profit_loss", {}),
                "balance_sheet": company.get("balance_sheet", {}),
                "cash_flow": company.get("cash_flow", {}),
                "ratios": company.get("ratios", {}),
            },
            "narrative": None,
        }

        # LLM narrative (optional, rate-limited)
        if with_llm:
            print(f"    Generating narrative...")
            report["narrative"] = generate_narrative(company, scores)
            time.sleep(4.5)  # 15 RPM = 4s between requests

        # Save individual report
        report_file = os.path.join(REPORTS_DIR, f"{cid}.json")
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)

        reports.append(report)

        # Track sector scores
        if sector not in sector_scores:
            sector_scores[sector] = []
        sector_scores[sector].append(scores["composite_score"])

    # Second pass: fill in peer composite scores
    score_lookup = {r["company_id"]: r for r in reports}
    for report in reports:
        for peer in report["peer_companies"]:
            peer_report = next(
                (r for r in reports if r["company_name"] == peer["name"]),
                None,
            )
            if peer_report:
                peer["composite_score"] = peer_report["composite_score"]
                peer["fraud_risk"] = peer_report["risk_level"]

        # Re-save with updated peers
        report_file = os.path.join(REPORTS_DIR, f"{report['company_id']}.json")
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)

    # Generate sector summary
    sector_summary = []
    for sector_name, scores_list in sorted(sector_scores.items()):
        avg = sum(scores_list) / len(scores_list)
        if avg <= 25:
            level = "Low"
        elif avg <= 50:
            level = "Medium"
        elif avg <= 75:
            level = "High"
        else:
            level = "Critical"

        sector_summary.append({
            "sector_name": sector_name,
            "avg_risk_score": round(avg, 2),
            "company_count": len(scores_list),
            "risk_level": level,
        })

    sector_summary.sort(key=lambda s: s["avg_risk_score"], reverse=True)

    with open(SECTOR_SUMMARY_FILE, "w") as f:
        json.dump(sector_summary, f, indent=2)

    print(f"\nDone! {len(reports)} reports generated.")
    print(f"Sector summary: {SECTOR_SUMMARY_FILE}")
    print(f"Reports: {REPORTS_DIR}/")


if __name__ == "__main__":
    main()
