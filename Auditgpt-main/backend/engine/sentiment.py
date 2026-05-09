"""
VADER sentiment analysis for auditor notes and management commentary.
When auditor notes are unavailable, falls back to analyzing financial
metric trends as a proxy sentiment signal.
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()


def analyze_text_sentiment(text: str) -> float:
    """Return compound sentiment score (-1 to 1) for a text."""
    if not text or not text.strip():
        return 0.0
    return analyzer.polarity_scores(text)["compound"]


def generate_proxy_sentiment(company_data: dict) -> dict:
    """
    Generate sentiment proxy from financial ratios when auditor notes
    are unavailable. Uses OPM, NPM, ROE trends to infer sentiment.
    Returns {year: sentiment_score}.
    """
    ratios = company_data.get("ratios", {})
    profit_loss = company_data.get("profit_loss", {})

    opm = ratios.get("OPM", {})
    npm = ratios.get("NPM", {})
    roe = ratios.get("ROE", {})
    net_profit = profit_loss.get("Net Profit", {})

    all_years = sorted(set(list(opm.keys()) + list(npm.keys()) + list(roe.keys())))
    sentiment = {}

    for i, year in enumerate(all_years):
        signals = []

        # OPM trend
        o = opm.get(year)
        if o is not None:
            if o > 20:
                signals.append(0.3)
            elif o > 10:
                signals.append(0.1)
            elif o > 0:
                signals.append(-0.1)
            else:
                signals.append(-0.4)

        # NPM trend
        n = npm.get(year)
        if n is not None:
            if n > 15:
                signals.append(0.3)
            elif n > 5:
                signals.append(0.1)
            elif n > 0:
                signals.append(-0.1)
            else:
                signals.append(-0.5)

        # ROE
        r = roe.get(year)
        if r is not None:
            if r > 20:
                signals.append(0.3)
            elif r > 10:
                signals.append(0.1)
            elif r > 0:
                signals.append(-0.1)
            else:
                signals.append(-0.4)

        # Net profit direction (YoY)
        if i > 0:
            prev_year = all_years[i - 1]
            np_curr = net_profit.get(year)
            np_prev = net_profit.get(prev_year)
            if np_curr is not None and np_prev is not None and np_prev != 0:
                growth = (np_curr - np_prev) / abs(np_prev)
                if growth > 0.2:
                    signals.append(0.3)
                elif growth > 0:
                    signals.append(0.1)
                elif growth > -0.2:
                    signals.append(-0.2)
                else:
                    signals.append(-0.5)

        if signals:
            sentiment[year] = round(sum(signals) / len(signals), 3)
        else:
            sentiment[year] = 0.0

    return sentiment
