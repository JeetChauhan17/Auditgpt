"""
Screener.in scraper — fetches 10-year financials for top NSE companies.
Caches results as JSON in backend/data/companies/.

Usage: python scripts/fetch_data.py [--limit N]
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data.ingestion import fetch_all, TOP_COMPANIES


def main():
    limit = None
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        if idx + 1 < len(sys.argv):
            limit = int(sys.argv[idx + 1])

    companies = TOP_COMPANIES[:limit] if limit else TOP_COMPANIES
    print(f"Fetching {len(companies)} companies from Screener.in...")
    results = fetch_all(companies, delay=1.5)
    print(f"Done! {len(results)} companies cached.")


if __name__ == "__main__":
    main()
