"""
Scoring module — orchestrates all quantitative analyses for a single company
and produces the complete forensic report data.
"""

import re

from backend.engine.quantitative import (
    beneish_m_score,
    altman_z_score,
    compute_anomaly_map,
    industry_z_score_aggregate,
    detect_trend_breaks,
    compute_composite_score,
    get_sorted_years,
    get_metric_values,
)


def parse_year(year_str: str) -> int:
    """Extract numeric year from 'Mar 2025' format. Returns 0 if unparseable."""
    match = re.search(r'(\d{4})', str(year_str))
    return int(match.group(1)) if match else 0


def generate_red_flags(beneish: dict, altman: dict, anomaly_map: dict, trend_breaks: dict, years: list[str]) -> list[dict]:
    """Generate red flag entries from quantitative analysis."""
    flags = []

    # Beneish flags
    if beneish.get("manipulation_likely"):
        m = beneish["m_score"]
        severity = "Critical" if m > -0.5 else "High"
        flags.append({
            "flag_type": "Beneish M-Score indicates manipulation",
            "severity": severity,
            "first_appeared": parse_year(years[-1]) if years else 0,
            "evolution": [f"M-Score = {m} (threshold: -1.78)"],
            "industry_context": "M-Score > -1.78 suggests earnings manipulation per Beneish (1999)",
            "citation": {
                "filing_year": parse_year(years[-1]) if years else 0,
                "filing_type": "P&L",
                "metric_name": "M-Score",
                "reported_value": m,
                "source": "Computed from Screener.in data",
            },
        })

    # Altman flags
    if altman.get("zone") == "distress":
        z = altman["z_score"]
        flags.append({
            "flag_type": "Altman Z-Score indicates financial distress",
            "severity": "High",
            "first_appeared": parse_year(years[-1]) if years else 0,
            "evolution": [f"Z-Score = {z} (distress < 1.8)"],
            "industry_context": "Z < 1.8 indicates high probability of bankruptcy per Altman (1968)",
            "citation": {
                "filing_year": parse_year(years[-1]) if years else 0,
                "filing_type": "Balance Sheet",
                "metric_name": "Z-Score",
                "reported_value": z,
                "source": "Computed from Screener.in data",
            },
        })

    # Anomaly map flags — high z-scores
    for ratio, year_scores in anomaly_map.items():
        for year, z in year_scores.items():
            if z is not None and abs(z) > 2.5:
                direction = "above" if z > 0 else "below"
                flags.append({
                    "flag_type": f"{ratio} significantly {direction} industry norm",
                    "severity": "High" if abs(z) > 3 else "Medium",
                    "first_appeared": parse_year(year),
                    "evolution": [f"Z-score = {z:.2f} in {year}"],
                    "industry_context": f"{ratio} deviates {abs(z):.1f} std from sector average",
                    "citation": {
                        "filing_year": parse_year(year),
                        "filing_type": "Ratios",
                        "metric_name": ratio,
                        "reported_value": z,
                        "source": "Industry-adjusted z-score",
                    },
                })

    # Trend break flags
    for ratio, break_years in trend_breaks.get("breaks", {}).items():
        for year in break_years:
            flags.append({
                "flag_type": f"Sudden change in {ratio}",
                "severity": "Medium",
                "first_appeared": parse_year(year),
                "evolution": [f"Abnormal year-over-year change detected in {year}"],
                "industry_context": f"YoY change in {ratio} exceeded 2 standard deviations from historical pattern",
                "citation": {
                    "filing_year": parse_year(year),
                    "filing_type": "Ratios",
                    "metric_name": ratio,
                    "reported_value": 0,
                    "source": "Trend break detection",
                },
            })

    # Sort by severity (Critical > High > Medium > Low)
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    flags.sort(key=lambda f: severity_order.get(f["severity"], 4))

    return flags


def score_company(company_data: dict, peer_data: list[dict]) -> dict:
    """
    Run full quantitative analysis on a company.
    Returns all scores, anomaly map, red flags, and composite score.
    """
    years = get_sorted_years(company_data)
    if len(years) < 2:
        return {
            "composite_score": 0,
            "risk_level": "Low",
            "beneish": {"m_score": None, "manipulation_likely": False, "components": {}},
            "altman": {"z_score": None, "zone": "unknown", "components": {}},
            "anomaly_map": {},
            "trend_breaks": {"breaks": {}, "total_count": 0},
            "red_flags": [],
            "breakdown": {},
        }

    latest_year = years[-1]
    prev_year = years[-2]

    # 1. Beneish M-Score
    beneish = beneish_m_score(company_data, latest_year, prev_year)

    # 2. Altman Z-Score
    altman = altman_z_score(company_data, latest_year)

    # 3. Industry-adjusted z-scores (anomaly map)
    anomaly_map = compute_anomaly_map(company_data, peer_data)
    industry_z_agg = industry_z_score_aggregate(anomaly_map)

    # 4. Trend break detection
    trend_breaks = detect_trend_breaks(company_data)

    # 5. Composite score
    composite = compute_composite_score(beneish, altman, industry_z_agg, trend_breaks)

    # 6. Red flags
    red_flags = generate_red_flags(beneish, altman, anomaly_map, trend_breaks, years)

    return {
        "composite_score": composite["composite_score"],
        "risk_level": composite["risk_level"],
        "beneish": beneish,
        "altman": altman,
        "anomaly_map": anomaly_map,
        "trend_breaks": trend_breaks,
        "red_flags": red_flags,
        "breakdown": composite["breakdown"],
    }
