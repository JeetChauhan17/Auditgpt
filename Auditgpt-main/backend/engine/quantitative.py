"""
Quantitative fraud detection engine.
Computes Beneish M-Score, Altman Z-Score, industry-adjusted z-scores,
and trend break detection from Screener.in financial data.
"""

import numpy as np
from scipy import stats


def safe_div(a, b, default=0.0):
    """Division that returns default on zero/None divisor."""
    if b is None or b == 0:
        return default
    if a is None:
        return default
    return a / b


def get_metric_values(data: dict, metric: str) -> dict:
    """Extract {year: value} for a given metric from financial data.
    Handles Screener.in naming quirks ('+', '%' suffixes, alternate names).
    """
    # Mapping of our canonical names to Screener.in variants
    ALIASES = {
        "Sales": ["Sales", "Sales+", "Revenue", "Revenue+"],
        "OPM": ["OPM", "OPM %"],
        "NPM": ["NPM", "NPM %"],
        "ROE": ["ROE", "ROE %", "Return on Equity"],
        "ROCE": ["ROCE", "ROCE %"],
        "Operating Profit": ["Operating Profit", "Operating Profit+"],
        "Net Profit": ["Net Profit", "Net Profit+", "Profit after tax"],
        "Debtors": ["Debtors", "Debtors+", "Trade Receivables"],
        "Fixed Assets": ["Fixed Assets", "Fixed Assets+"],
        "Total Assets": ["Total Assets", "Total Assets+"],
        "Borrowings": ["Borrowings", "Borrowings+"],
        "Depreciation": ["Depreciation", "Depreciation+"],
        "Employee Cost": ["Employee Cost", "Employee Cost+"],
        "Cash from Operating Activity": [
            "Cash from Operating Activity",
            "Cash from Operating Activity+",
            "Cash from Operations",
        ],
        "Debt to equity": ["Debt to equity", "Debt to Equity"],
        "Current Ratio": ["Current Ratio"],
        "Interest Coverage Ratio": ["Interest Coverage Ratio"],
        "Debtor Days": ["Debtor Days"],
        "Inventory Turnover": ["Inventory Turnover", "Inventory Days"],
        "Asset Turnover": ["Asset Turnover"],
        "Dividend Payout": ["Dividend Payout", "Dividend Payout %"],
        "Earnings Per Share": ["Earnings Per Share", "EPS"],
        "Share Capital": ["Share Capital", "Equity Capital"],
        "Reserves": ["Reserves", "Reserves+"],
        "Other Liabilities": ["Other Liabilities", "Other Liabilities+"],
        "Other Assets": ["Other Assets", "Other Assets+"],
    }

    names_to_try = ALIASES.get(metric, [metric])

    for section in ["profit_loss", "balance_sheet", "cash_flow", "ratios"]:
        section_data = data.get(section, {})
        for name in names_to_try:
            if name in section_data:
                return {
                    k: v for k, v in section_data[name].items()
                    if v is not None
                }
    return {}


def get_sorted_years(data: dict) -> list[str]:
    """Get all available annual years sorted. Filters out TTM, quarterly entries."""
    years = set()
    for section in ["profit_loss", "balance_sheet", "cash_flow", "ratios"]:
        for metric_values in data.get(section, {}).values():
            years.update(metric_values.keys())
    # Keep only "Mar YYYY" format (annual) — filter out TTM, Sep, Jun, etc.
    annual = [y for y in years if y.startswith("Mar ")]
    return sorted(annual)


# ── Beneish M-Score ──────────────────────────────────────────────────────

# def compute_dsri(data: dict, year: str, prev_year: str) -> float | None:
#     """Days Sales in Receivables Index."""
#     receivables = get_metric_values(data, "Debtors")
#     revenue = get_metric_values(data, "Sales")
#     recv_t = receivables.get(year)
#     recv_p = receivables.get(prev_year)
#     rev_t = revenue.get(year)
#     rev_p = revenue.get(prev_year)
#     if None in (recv_t, recv_p, rev_t, rev_p) or rev_t == 0 or rev_p == 0:
#         return None
#     dsr_t = recv_t / rev_t
#     dsr_p = recv_p / rev_p
#     return safe_div(dsr_t, dsr_p, None)

def compute_dsri(data: dict, year: str, prev_year: str) -> float | None:
    """Days Sales in Receivables Index. Falls back to Debtor Days if balance sheet field missing."""
    receivables = get_metric_values(data, "Debtors")
    revenue = get_metric_values(data, "Sales")
    recv_t = receivables.get(year)
    recv_p = receivables.get(prev_year)
    rev_t = revenue.get(year)
    rev_p = revenue.get(prev_year)
    if None not in (recv_t, recv_p, rev_t, rev_p) and rev_t != 0 and rev_p != 0:
        return safe_div(recv_t / rev_t, recv_p / rev_p, None)

    # Fallback: Debtor Days is receivables/revenue * 365 — ratio of ratios gives DSRI directly
    dd = get_metric_values(data, "Debtor Days")
    dd_t = dd.get(year)
    dd_p = dd.get(prev_year)
    if dd_t is not None and dd_p is not None and dd_p != 0:
        return safe_div(dd_t, dd_p, None)
    return None


# def compute_gmi(data: dict, year: str, prev_year: str) -> float | None:
#     """Gross Margin Index."""
#     revenue = get_metric_values(data, "Sales")
#     # Use operating profit as proxy for gross profit
#     cogs_metrics = ["Material Cost %", "Manufacturing Cost %"]
#     rev_t = revenue.get(year)
#     rev_p = revenue.get(prev_year)

#     # Try direct OPM
#     opm = get_metric_values(data, "OPM")
#     opm_t = opm.get(year)
#     opm_p = opm.get(prev_year)
#     if opm_t is not None and opm_p is not None and opm_t != 0:
#         return safe_div(opm_p, opm_t, None)
#     return None


def compute_gmi(data: dict, year: str, prev_year: str) -> float | None:
    """Gross Margin Index — uses Operating Profit / Sales since OPM % is often null."""
    op = get_metric_values(data, "Operating Profit")
    revenue = get_metric_values(data, "Sales")
    op_t = op.get(year)
    op_p = op.get(prev_year)
    rev_t = revenue.get(year)
    rev_p = revenue.get(prev_year)
    if None in (op_t, op_p, rev_t, rev_p) or rev_t == 0 or rev_p == 0:
        return None
    gm_t = op_t / rev_t
    gm_p = op_p / rev_p
    return safe_div(gm_p, gm_t, None)  # GMI = prior year margin / current year margin

def compute_aqi(data: dict, year: str, prev_year: str) -> float | None:
    """Asset Quality Index."""
    total_assets = get_metric_values(data, "Total Assets")
    # Current assets approximation
    fixed_assets = get_metric_values(data, "Fixed Assets")
    ta_t = total_assets.get(year)
    ta_p = total_assets.get(prev_year)
    fa_t = fixed_assets.get(year)
    fa_p = fixed_assets.get(prev_year)
    if None in (ta_t, ta_p, fa_t, fa_p) or ta_t == 0 or ta_p == 0:
        return None
    # Current assets = total assets - fixed assets (simplified)
    ca_t = ta_t - fa_t
    ca_p = ta_p - fa_p
    nca_ratio_t = 1 - safe_div(ca_t, ta_t)
    nca_ratio_p = 1 - safe_div(ca_p, ta_p)
    return safe_div(nca_ratio_t, nca_ratio_p, None)


def compute_sgi(data: dict, year: str, prev_year: str) -> float | None:
    """Sales Growth Index."""
    revenue = get_metric_values(data, "Sales")
    rev_t = revenue.get(year)
    rev_p = revenue.get(prev_year)
    return safe_div(rev_t, rev_p, None)


def compute_depi(data: dict, year: str, prev_year: str) -> float | None:
    """Depreciation Index."""
    depreciation = get_metric_values(data, "Depreciation")
    fixed_assets = get_metric_values(data, "Fixed Assets")
    dep_t = depreciation.get(year)
    dep_p = depreciation.get(prev_year)
    fa_t = fixed_assets.get(year)
    fa_p = fixed_assets.get(prev_year)
    if None in (dep_t, dep_p, fa_t, fa_p):
        return None
    rate_t = safe_div(dep_t, fa_t + dep_t)
    rate_p = safe_div(dep_p, fa_p + dep_p)
    return safe_div(rate_p, rate_t, None)


def compute_sgai(data: dict, year: str, prev_year: str) -> float | None:
    """SGA Expense Index (using Employee Cost as proxy)."""
    sga = get_metric_values(data, "Employee Cost")
    revenue = get_metric_values(data, "Sales")
    sga_t = sga.get(year)
    sga_p = sga.get(prev_year)
    rev_t = revenue.get(year)
    rev_p = revenue.get(prev_year)
    if None in (sga_t, sga_p, rev_t, rev_p) or rev_t == 0 or rev_p == 0:
        return None
    ratio_t = sga_t / rev_t
    ratio_p = sga_p / rev_p
    return safe_div(ratio_t, ratio_p, None)


def compute_lvgi(data: dict, year: str, prev_year: str) -> float | None:
    """Leverage Index."""
    debt = get_metric_values(data, "Borrowings")
    total_assets = get_metric_values(data, "Total Assets")
    d_t = debt.get(year, 0)
    d_p = debt.get(prev_year, 0)
    ta_t = total_assets.get(year)
    ta_p = total_assets.get(prev_year)
    if None in (ta_t, ta_p) or ta_t == 0 or ta_p == 0:
        return None
    lev_t = d_t / ta_t if d_t else 0
    lev_p = d_p / ta_p if d_p else 0
    return safe_div(lev_t, lev_p, None)


def compute_tata(data: dict, year: str) -> float | None:
    """Total Accruals to Total Assets."""
    net_income = get_metric_values(data, "Net Profit")
    cfo = get_metric_values(data, "Cash from Operating Activity")
    total_assets = get_metric_values(data, "Total Assets")
    ni = net_income.get(year)
    cf = cfo.get(year)
    ta = total_assets.get(year)
    if None in (ni, cf, ta) or ta == 0:
        return None
    return (ni - cf) / ta


def beneish_m_score(data: dict, year: str, prev_year: str) -> dict:
    """
    Compute Beneish M-Score for manipulation detection.
    M = -4.84 + 0.920*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI
        + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI

    M > -1.78 indicates likely manipulation.
    """
    dsri = compute_dsri(data, year, prev_year)
    gmi = compute_gmi(data, year, prev_year)
    aqi = compute_aqi(data, year, prev_year)
    sgi = compute_sgi(data, year, prev_year)
    depi = compute_depi(data, year, prev_year)
    sgai = compute_sgai(data, year, prev_year)
    lvgi = compute_lvgi(data, year, prev_year)
    tata = compute_tata(data, year)

    components = {
        "DSRI": dsri, "GMI": gmi, "AQI": aqi, "SGI": sgi,
        "DEPI": depi, "SGAI": sgai, "LVGI": lvgi, "TATA": tata,
    }

    # Use defaults for missing values (neutral = 1.0 for ratios, 0 for TATA)
    d = dsri if dsri is not None else 1.0
    g = gmi if gmi is not None else 1.0
    a = aqi if aqi is not None else 1.0
    s = sgi if sgi is not None else 1.0
    dp = depi if depi is not None else 1.0
    sg = sgai if sgai is not None else 1.0
    lv = lvgi if lvgi is not None else 1.0
    ta = tata if tata is not None else 0.0

    m_score = (
        -4.84
        + 0.920 * d
        + 0.528 * g
        + 0.404 * a
        + 0.892 * s
        + 0.115 * dp
        - 0.172 * sg
        + 4.679 * ta
        - 0.327 * lv
    )

    return {
        "m_score": round(m_score, 4),
        "manipulation_likely": m_score > -1.78,
        "components": {k: round(v, 4) if v is not None else None for k, v in components.items()},
    }


# ── Altman Z-Score ───────────────────────────────────────────────────────

def altman_z_score(data: dict, year: str) -> dict:
    """
    Compute Altman Z-Score for bankruptcy prediction.
    Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 1.0*X5

    Z < 1.8 = distress, 1.8-3.0 = grey zone, > 3.0 = safe.
    """
    total_assets = get_metric_values(data, "Total Assets")
    ta = total_assets.get(year)
    if not ta or ta == 0:
        return {"z_score": None, "zone": "unknown", "components": {}}

    # X1 = Working Capital / Total Assets
    current_assets_data = get_metric_values(data, "Other Assets")
    current_liabilities_data = get_metric_values(data, "Other Liabilities")
    # Approximate working capital
    reserves = get_metric_values(data, "Reserves")
    equity = get_metric_values(data, "Share Capital")
    borrowings = get_metric_values(data, "Borrowings")
    total_liab = get_metric_values(data, "Total Liabilities") if "Total Liabilities" in str(data) else {}

    # Simplified: use ratios if available
    current_ratio = get_metric_values(data, "Current Ratio")
    cr = current_ratio.get(year)

    # X1 approximation using current ratio
    if cr and cr > 0:
        # If current ratio > 1, working capital is positive
        x1 = (cr - 1) / (cr + 1) * 0.5  # Normalized approximation
    else:
        x1 = 0

    # X2 = Retained Earnings / Total Assets
    res = reserves.get(year, 0)
    x2 = safe_div(res, ta)

    # X3 = EBIT / Total Assets
    ebit_data = get_metric_values(data, "Operating Profit")
    ebit = ebit_data.get(year, 0)
    x3 = safe_div(ebit, ta)

    # X4 = Market Cap / Total Liabilities (use book equity if no market cap)
    eq = equity.get(year, 0) + reserves.get(year, 0)
    borr = borrowings.get(year, 0)
    market_cap = data.get("market_cap", eq)  # Fallback to book equity
    total_liabilities = ta - eq if eq else ta
    x4 = safe_div(market_cap, max(total_liabilities, 1))

    # X5 = Revenue / Total Assets
    revenue = get_metric_values(data, "Sales")
    rev = revenue.get(year, 0)
    x5 = safe_div(rev, ta)

    z = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5

    if z > 3.0:
        zone = "safe"
    elif z > 1.8:
        zone = "grey"
    else:
        zone = "distress"

    return {
        "z_score": round(z, 4),
        "zone": zone,
        "components": {
            "X1_working_capital_ta": round(x1, 4),
            "X2_retained_earnings_ta": round(x2, 4),
            "X3_ebit_ta": round(x3, 4),
            "X4_market_cap_tl": round(x4, 4),
            "X5_revenue_ta": round(x5, 4),
        },
    }


# ── Industry-Adjusted Z-Scores ──────────────────────────────────────────

# 12 key financial ratios for anomaly detection
KEY_RATIOS = [
    "OPM", "NPM", "ROE", "ROCE", "Debt to equity",
    "Current Ratio", "Interest Coverage Ratio",
    "Debtor Days", "Inventory Turnover", "Asset Turnover",
    "Dividend Payout", "Earnings Per Share",
]


def compute_industry_z_scores(
    company_data: dict,
    peer_data: list[dict],
    year: str,
) -> dict:
    """
    Compute industry-adjusted z-scores for 12 key ratios.
    Z = (company_value - industry_mean) / industry_std

    Returns {ratio_name: z_score} for the given year.
    """
    z_scores = {}

    for ratio in KEY_RATIOS:
        company_val = get_metric_values(company_data, ratio).get(year)
        if company_val is None:
            z_scores[ratio] = None
            continue

        peer_vals = []
        for peer in peer_data:
            v = get_metric_values(peer, ratio).get(year)
            if v is not None:
                peer_vals.append(v)

        if len(peer_vals) < 2:
            # Not enough peers for meaningful z-score
            z_scores[ratio] = None
            continue

        # Include company in the distribution
        all_vals = peer_vals + [company_val]
        mean = np.mean(all_vals)
        std = np.std(all_vals, ddof=1)

        if std == 0:
            z_scores[ratio] = 0.0
        else:
            z_scores[ratio] = round((company_val - mean) / std, 4)

    return z_scores


def compute_anomaly_map(
    company_data: dict,
    peer_data: list[dict],
) -> dict:
    """
    Compute industry-adjusted z-scores for all years and all key ratios.
    Returns {ratio: {year: z_score}} — the anomaly heatmap data.
    """
    years = get_sorted_years(company_data)
    anomaly_map = {}

    for ratio in KEY_RATIOS:
        anomaly_map[ratio] = {}
        for year in years:
            z_scores = compute_industry_z_scores(company_data, peer_data, year)
            anomaly_map[ratio][year] = z_scores.get(ratio)

    return anomaly_map


def industry_z_score_aggregate(anomaly_map: dict) -> float:
    """
    Compute aggregate industry z-score: average |z| across all ratios and years.
    Score = min((avg_abs_z / 3) * 100, 100)
    """
    all_z = []
    for ratio_scores in anomaly_map.values():
        for z in ratio_scores.values():
            if z is not None:
                all_z.append(abs(z))

    if not all_z:
        return 0.0

    avg_abs_z = np.mean(all_z)
    return min((avg_abs_z / 3) * 100, 100)


# ── Trend Break Detection ────────────────────────────────────────────────

def detect_trend_breaks(company_data: dict, threshold: float = 2.0) -> dict:
    """
    Detect sudden changes in financial ratios year-over-year.
    A break is when YoY change > threshold standard deviations from
    the mean YoY change for that ratio.

    Returns {ratio: [years_with_breaks]} and total count.
    """
    breaks = {}
    total_count = 0

    for ratio in KEY_RATIOS:
        values = get_metric_values(company_data, ratio)
        if not values:
            continue

        # sorted_years = sorted(values.keys())
        sorted_years = sorted([y for y in values.keys() if y.startswith("Mar ")])
        if len(sorted_years) < 3:
            continue

        # Compute YoY changes
        yoy_changes = []
        for i in range(1, len(sorted_years)):
            prev_val = values.get(sorted_years[i - 1])
            curr_val = values.get(sorted_years[i])
            if prev_val is not None and curr_val is not None and prev_val != 0:
                pct_change = (curr_val - prev_val) / abs(prev_val)
                yoy_changes.append((sorted_years[i], pct_change))

        if len(yoy_changes) < 3:
            continue

        changes_only = [c[1] for c in yoy_changes]
        mean_change = np.mean(changes_only)
        std_change = np.std(changes_only, ddof=1)

        if std_change == 0:
            continue

        ratio_breaks = []
        for year, change in yoy_changes:
            z = abs(change - mean_change) / std_change
            if z > threshold:
                ratio_breaks.append(year)

        if ratio_breaks:
            breaks[ratio] = ratio_breaks
            total_count += len(ratio_breaks)

    return {"breaks": breaks, "total_count": total_count}


# ── Composite Score ──────────────────────────────────────────────────────

def compute_composite_score(
    beneish: dict,
    altman: dict,
    industry_z_agg: float,
    trend_breaks: dict,
) -> dict:
    """
    Composite Fraud Risk Score (0-100):
    - Beneish M-Score:            35%
    - Altman Z-Score:             30%
    - Industry-Adjusted Z-Score:  25%
    - Trend Break Count:          10%

    Normalization:
    - Beneish: Score = min(max((M + 3) / 5 * 100, 0), 100)
    - Altman:  Score = min(max((4 - Z) / 4 * 100, 0), 100)
    - Industry Z: already 0-100 from industry_z_score_aggregate()
    - Trend Breaks: Score = (break_count / 12) * 100
    """
    m = beneish.get("m_score")
    z = altman.get("z_score")

    # Normalize Beneish: higher M = higher risk
    if m is not None:
        beneish_norm = min(max((m + 3) / 5 * 100, 0), 100)
    else:
        beneish_norm = 50  # Unknown = medium risk

    # Normalize Altman: lower Z = higher risk
    if z is not None:
        altman_norm = min(max((4 - z) / 4 * 100, 0), 100)
    else:
        altman_norm = 50

    # Industry Z is already 0-100
    industry_norm = industry_z_agg

    # Trend breaks
    break_count = trend_breaks.get("total_count", 0)
    trend_norm = min((break_count / 12) * 100, 100)

    composite = (
        0.35 * beneish_norm
        + 0.30 * altman_norm
        + 0.25 * industry_norm
        + 0.10 * trend_norm
    )

    # Risk level
    if composite <= 25:
        risk_level = "Low"
    elif composite <= 50:
        risk_level = "Medium"
    elif composite <= 75:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return {
        "composite_score": round(composite, 2),
        "risk_level": risk_level,
        "breakdown": {
            "beneish_normalized": round(beneish_norm, 2),
            "altman_normalized": round(altman_norm, 2),
            "industry_z_normalized": round(industry_norm, 2),
            "trend_break_normalized": round(trend_norm, 2),
        },
    }
