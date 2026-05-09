"""
Screener.in data ingestion module.
Scrapes 10-year financial data (P&L, Balance Sheet, Cash Flow, Ratios)
for NSE-listed companies and caches as JSON.
"""

import json
import os
import re
import time

import requests
from bs4 import BeautifulSoup

DATA_DIR = os.path.join(os.path.dirname(__file__), "companies")
SCREENER_BASE = "https://www.screener.in/company"

# Headers to mimic browser request
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# Top 200 NSE companies by market cap (representative list)
# Format: (screener_slug, display_name, sector)
TOP_COMPANIES = [
    ("RELIANCE", "Reliance Industries", "Oil & Gas"),
    ("TCS", "Tata Consultancy Services", "IT Services"),
    ("HDFCBANK", "HDFC Bank", "Banking"),
    ("INFY", "Infosys", "IT Services"),
    ("ICICIBANK", "ICICI Bank", "Banking"),
    ("HINDUNILVR", "Hindustan Unilever", "FMCG"),
    ("SBIN", "State Bank of India", "Banking"),
    ("BHARTIARTL", "Bharti Airtel", "Telecom"),
    ("ITC", "ITC", "FMCG"),
    ("KOTAKBANK", "Kotak Mahindra Bank", "Banking"),
    ("LT", "Larsen & Toubro", "Construction"),
    ("HCLTECH", "HCL Technologies", "IT Services"),
    ("AXISBANK", "Axis Bank", "Banking"),
    ("ASIANPAINT", "Asian Paints", "Consumer Durables"),
    ("MARUTI", "Maruti Suzuki", "Automobiles"),
    ("SUNPHARMA", "Sun Pharma", "Pharmaceuticals"),
    ("TITAN", "Titan Company", "Consumer Durables"),
    ("BAJFINANCE", "Bajaj Finance", "Financial Services"),
    ("DMART", "Avenue Supermarts", "Retail"),
    ("ULTRACEMCO", "UltraTech Cement", "Cement"),
    ("WIPRO", "Wipro", "IT Services"),
    ("ONGC", "ONGC", "Oil & Gas"),
    ("NTPC", "NTPC", "Power"),
    ("POWERGRID", "Power Grid Corp", "Power"),
    ("TATAMOTORS", "Tata Motors", "Automobiles"),
    ("TATASTEEL", "Tata Steel", "Metals"),
    ("JSWSTEEL", "JSW Steel", "Metals"),
    ("ADANIENT", "Adani Enterprises", "Diversified"),
    ("ADANIPORTS", "Adani Ports", "Infrastructure"),
    ("COALINDIA", "Coal India", "Mining"),
    ("BAJAJFINSV", "Bajaj Finserv", "Financial Services"),
    ("TECHM", "Tech Mahindra", "IT Services"),
    ("NESTLEIND", "Nestle India", "FMCG"),
    ("INDUSINDBK", "IndusInd Bank", "Banking"),
    ("GRASIM", "Grasim Industries", "Cement"),
    ("CIPLA", "Cipla", "Pharmaceuticals"),
    ("DRREDDY", "Dr Reddy's Labs", "Pharmaceuticals"),
    ("DIVISLAB", "Divi's Laboratories", "Pharmaceuticals"),
    ("BRITANNIA", "Britannia Industries", "FMCG"),
    ("EICHERMOT", "Eicher Motors", "Automobiles"),
    ("HEROMOTOCO", "Hero MotoCorp", "Automobiles"),
    ("APOLLOHOSP", "Apollo Hospitals", "Healthcare"),
    ("SBILIFE", "SBI Life Insurance", "Insurance"),
    ("HDFCLIFE", "HDFC Life Insurance", "Insurance"),
    ("DABUR", "Dabur India", "FMCG"),
    ("PIDILITIND", "Pidilite Industries", "Chemicals"),
    ("HAVELLS", "Havells India", "Consumer Durables"),
    ("GODREJCP", "Godrej Consumer Products", "FMCG"),
    ("SHREECEM", "Shree Cement", "Cement"),
    ("AMBUJACEM", "Ambuja Cements", "Cement"),
    ("BERGEPAINT", "Berger Paints", "Consumer Durables"),
    ("SIEMENS", "Siemens", "Industrial"),
    ("ABB", "ABB India", "Industrial"),
    ("TATACONSUM", "Tata Consumer Products", "FMCG"),
    ("HINDPETRO", "Hindustan Petroleum", "Oil & Gas"),
    ("BPCL", "Bharat Petroleum", "Oil & Gas"),
    ("IOC", "Indian Oil Corporation", "Oil & Gas"),
    ("DLF", "DLF", "Real Estate"),
    ("BAJAJ-AUTO", "Bajaj Auto", "Automobiles"),
    ("TVSMOTOR", "TVS Motor", "Automobiles"),
    ("M&M", "Mahindra & Mahindra", "Automobiles"),
    ("VEDL", "Vedanta", "Metals"),
    ("HINDALCO", "Hindalco", "Metals"),
    ("BANKBARODA", "Bank of Baroda", "Banking"),
    ("PNB", "Punjab National Bank", "Banking"),
    ("CANBK", "Canara Bank", "Banking"),
    ("RECLTD", "REC Limited", "Financial Services"),
    ("PFC", "Power Finance Corp", "Financial Services"),
    ("CHOLAFIN", "Cholamandalam Finance", "Financial Services"),
    ("MUTHOOTFIN", "Muthoot Finance", "Financial Services"),
    ("SBICARD", "SBI Cards", "Financial Services"),
    ("MARICO", "Marico", "FMCG"),
    ("COLPAL", "Colgate Palmolive", "FMCG"),
    ("TRENT", "Trent", "Retail"),
    ("ZOMATO", "Zomato", "Internet"),
    ("PAYTM", "Paytm", "Internet"),
    ("NAUKRI", "Info Edge", "Internet"),
    ("POLICYBZR", "PB Fintech", "Internet"),
    ("IRCTC", "IRCTC", "Travel"),
    ("HAL", "Hindustan Aeronautics", "Defence"),
    ("BEL", "Bharat Electronics", "Defence"),
    ("BHEL", "BHEL", "Industrial"),
    ("GAIL", "GAIL India", "Oil & Gas"),
    ("TATAPOWER", "Tata Power", "Power"),
    ("ADANIGREEN", "Adani Green Energy", "Power"),
    ("TORNTPHARM", "Torrent Pharma", "Pharmaceuticals"),
    ("LUPIN", "Lupin", "Pharmaceuticals"),
    ("AUROPHARMA", "Aurobindo Pharma", "Pharmaceuticals"),
    ("BIOCON", "Biocon", "Pharmaceuticals"),
    ("MAXHEALTH", "Max Healthcare", "Healthcare"),
    ("FORTIS", "Fortis Healthcare", "Healthcare"),
    ("MPHASIS", "Mphasis", "IT Services"),
    ("LTIM", "LTIMindtree", "IT Services"),
    ("PERSISTENT", "Persistent Systems", "IT Services"),
    ("COFORGE", "Coforge", "IT Services"),
    ("PAGEIND", "Page Industries", "Textiles"),
    ("VOLTAS", "Voltas", "Consumer Durables"),
    ("WHIRLPOOL", "Whirlpool India", "Consumer Durables"),
    ("CROMPTON", "Crompton Greaves", "Consumer Durables"),
    ("ACC", "ACC", "Cement"),
    ("RAMCOCEM", "Ramco Cements", "Cement"),
    ("UPL", "UPL", "Chemicals"),
    ("SRF", "SRF", "Chemicals"),
    ("ATUL", "Atul", "Chemicals"),
    ("DEEPAKNTR", "Deepak Nitrite", "Chemicals"),
    ("BOSCHLTD", "Bosch", "Automobiles"),
    ("MRF", "MRF", "Automobiles"),
    ("CUMMINSIND", "Cummins India", "Industrial"),
    ("THERMAX", "Thermax", "Industrial"),
    ("LALPATHLAB", "Dr Lal PathLabs", "Healthcare"),
    ("METROPOLIS", "Metropolis Healthcare", "Healthcare"),
    ("IDFCFIRSTB", "IDFC First Bank", "Banking"),
    ("FEDERALBNK", "Federal Bank", "Banking"),
    ("BANDHANBNK", "Bandhan Bank", "Banking"),
    ("MANAPPURAM", "Manappuram Finance", "Financial Services"),
    ("LICHSGFIN", "LIC Housing Finance", "Financial Services"),
    ("SAIL", "SAIL", "Metals"),
    ("NMDC", "NMDC", "Mining"),
    ("NATIONALUM", "National Aluminium", "Metals"),
    ("JUBLFOOD", "Jubilant FoodWorks", "Consumer Durables"),
    ("TATAELXSI", "Tata Elxsi", "IT Services"),
    ("NAVINFLUOR", "Navin Fluorine", "Chemicals"),
    ("PIIND", "PI Industries", "Chemicals"),
    ("INDIGO", "InterGlobe Aviation", "Aviation"),
    ("CONCOR", "Container Corp", "Logistics"),
    ("OBEROIRLTY", "Oberoi Realty", "Real Estate"),
    ("GODREJPROP", "Godrej Properties", "Real Estate"),
    ("PRESTIGE", "Prestige Estates", "Real Estate"),
    ("PHOENIXLTD", "Phoenix Mills", "Real Estate"),
    ("MFSL", "Max Financial", "Insurance"),
    ("ICICIGI", "ICICI Lombard", "Insurance"),
    ("HDFCAMC", "HDFC AMC", "Financial Services"),
    ("CAMS", "CAMS", "Financial Services"),
    ("MCX", "Multi Commodity Exchange", "Financial Services"),
    ("BSE", "BSE", "Financial Services"),
    ("NIACL", "New India Assurance", "Insurance"),
    ("STARHEALTH", "Star Health", "Insurance"),
    ("IGL", "Indraprastha Gas", "Oil & Gas"),
    ("MGL", "Mahanagar Gas", "Oil & Gas"),
    ("PETRONET", "Petronet LNG", "Oil & Gas"),
    ("CASTROLIND", "Castrol India", "Oil & Gas"),
    ("MOTHERSON", "Motherson Sumi", "Automobiles"),
    ("ASHOKLEY", "Ashok Leyland", "Automobiles"),
    ("BALKRISIND", "Balkrishna Industries", "Automobiles"),
    ("ESCORTS", "Escorts Kubota", "Automobiles"),
    ("CESC", "CESC", "Power"),
    ("NHPC", "NHPC", "Power"),
    ("SJVN", "SJVN", "Power"),
    ("IRFC", "Indian Railway Finance", "Financial Services"),
    ("ABCAPITAL", "Aditya Birla Capital", "Financial Services"),
    ("L&TFH", "L&T Finance", "Financial Services"),
    ("CANFINHOME", "Can Fin Homes", "Financial Services"),
    ("AARTIIND", "Aarti Industries", "Chemicals"),
    ("CLEAN", "Clean Science", "Chemicals"),
    ("FINEORG", "Fine Organic", "Chemicals"),
    ("POLYCAB", "Polycab India", "Consumer Durables"),
    ("KEI", "KEI Industries", "Consumer Durables"),
    ("KAJARIACER", "Kajaria Ceramics", "Building Materials"),
    ("CENTURYTEX", "Century Textiles", "Textiles"),
    ("RELAXO", "Relaxo Footwears", "Consumer Durables"),
    ("BATAINDIA", "Bata India", "Consumer Durables"),
    ("VBL", "Varun Beverages", "FMCG"),
    ("ZYDUSLIFE", "Zydus Lifesciences", "Pharmaceuticals"),
    ("ALKEM", "Alkem Labs", "Pharmaceuticals"),
    ("IPCALAB", "IPCA Labs", "Pharmaceuticals"),
    ("GLENMARK", "Glenmark Pharma", "Pharmaceuticals"),
    ("ABFRL", "Aditya Birla Fashion", "Retail"),
    ("SHOPERSTOP", "Shoppers Stop", "Retail"),
    ("LICI", "Life Insurance Corp", "Insurance"),
    ("GICRE", "General Insurance Corp", "Insurance"),
    ("LINDEINDIA", "Linde India", "Chemicals"),
    ("SYNGENE", "Syngene International", "Pharmaceuticals"),
    ("LAURUSLABS", "Laurus Labs", "Pharmaceuticals"),
    ("ASTRAL", "Astral", "Building Materials"),
    ("SUPREMEIND", "Supreme Industries", "Building Materials"),
    ("APLAPOLLO", "APL Apollo Tubes", "Metals"),
    ("RATNAMANI", "Ratnamani Metals", "Metals"),
    ("DIXON", "Dixon Technologies", "Consumer Durables"),
    ("KAYNES", "Kaynes Technology", "Electronics"),
    ("COCHINSHIP", "Cochin Shipyard", "Defence"),
    ("MAZAGON", "Mazagon Dock", "Defence"),
    ("GRINDWELL", "Grindwell Norton", "Industrial"),
    ("CARBORUNIV", "Carborundum Universal", "Industrial"),
    ("EXIDEIND", "Exide Industries", "Automobiles"),
    ("AMARAJABAT", "Amara Raja Energy", "Automobiles"),
]


def parse_screener_table(soup: BeautifulSoup, section_id: str) -> dict:
    """Parse a Screener.in financial table into {metric: {year: value}}."""
    section = soup.find("section", {"id": section_id})
    if not section:
        return {}

    table = section.find("table")
    if not table:
        return {}

    # Get years from header
    header = table.find("thead")
    if not header:
        return {}

    headers = [th.get_text(strip=True) for th in header.find_all("th")]
    years = headers[1:]  # First column is metric name

    data = {}
    for row in table.find("tbody").find_all("tr"):
        cells = row.find_all("td")
        if len(cells) < 2:
            continue
        metric = cells[0].get_text(strip=True)
        values = {}
        for i, cell in enumerate(cells[1:]):
            if i < len(years):
                text = cell.get_text(strip=True).replace(",", "")
                try:
                    values[years[i]] = float(text)
                except ValueError:
                    values[years[i]] = None
        data[metric] = values
    return data


def fetch_company(slug: str, name: str, sector: str, delay: float = 1.0) -> dict | None:
    """Fetch financial data for a single company from Screener.in."""
    url = f"{SCREENER_BASE}/{slug}/consolidated/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code == 404:
            # Try standalone
            url = f"{SCREENER_BASE}/{slug}/"
            resp = requests.get(url, headers=HEADERS, timeout=15)

        if resp.status_code != 200:
            print(f"  SKIP {slug}: HTTP {resp.status_code}")
            return None

        soup = BeautifulSoup(resp.text, "html.parser")

        company_data = {
            "company_id": slug,
            "company_name": name,
            "sector": sector,
            "profit_loss": parse_screener_table(soup, "profit-loss"),
            "balance_sheet": parse_screener_table(soup, "balance-sheet"),
            "cash_flow": parse_screener_table(soup, "cash-flow"),
            "ratios": parse_screener_table(soup, "ratios"),
        }

        # Extract market cap if available
        top_ratios = soup.find("ul", {"id": "top-ratios"})
        if top_ratios:
            for li in top_ratios.find_all("li"):
                label = li.find("span", class_="name")
                value = li.find("span", class_="number")
                if label and value:
                    label_text = label.get_text(strip=True)
                    value_text = value.get_text(strip=True).replace(",", "")
                    if "Market Cap" in label_text:
                        try:
                            company_data["market_cap"] = float(value_text)
                        except ValueError:
                            pass

        time.sleep(delay)
        return company_data

    except requests.RequestException as e:
        print(f"  ERROR {slug}: {e}")
        return None


def fetch_all(companies: list[tuple] = None, delay: float = 1.5) -> list[dict]:
    """Fetch data for all companies and save to disk."""
    if companies is None:
        companies = TOP_COMPANIES

    os.makedirs(DATA_DIR, exist_ok=True)
    results = []

    for i, (slug, name, sector) in enumerate(companies):
        cache_file = os.path.join(DATA_DIR, f"{slug}.json")
        if os.path.exists(cache_file):
            print(f"  [{i+1}/{len(companies)}] CACHED {slug}")
            with open(cache_file) as f:
                results.append(json.load(f))
            continue

        print(f"  [{i+1}/{len(companies)}] Fetching {name} ({slug})...")
        data = fetch_company(slug, name, sector, delay=delay)
        if data:
            with open(cache_file, "w") as f:
                json.dump(data, f, indent=2)
            results.append(data)
        else:
            print(f"  [{i+1}/{len(companies)}] FAILED {slug}")

    return results


def load_cached_companies() -> list[dict]:
    """Load all cached company JSON files."""
    companies = []
    if not os.path.exists(DATA_DIR):
        return companies
    for fname in os.listdir(DATA_DIR):
        if fname.endswith(".json"):
            with open(os.path.join(DATA_DIR, fname)) as f:
                companies.append(json.load(f))
    return companies


# Industry mapping: sector -> list of key ratios to benchmark
INDUSTRY_MAPPING = {
    "IT Services": {"typical_opm": 22, "typical_roe": 28, "typical_de": 0.1},
    "Banking": {"typical_opm": None, "typical_roe": 14, "typical_de": None},
    "FMCG": {"typical_opm": 18, "typical_roe": 30, "typical_de": 0.3},
    "Pharmaceuticals": {"typical_opm": 20, "typical_roe": 16, "typical_de": 0.4},
    "Automobiles": {"typical_opm": 12, "typical_roe": 15, "typical_de": 0.6},
    "Oil & Gas": {"typical_opm": 10, "typical_roe": 12, "typical_de": 0.8},
    "Metals": {"typical_opm": 15, "typical_roe": 12, "typical_de": 0.9},
    "Cement": {"typical_opm": 18, "typical_roe": 12, "typical_de": 0.5},
    "Power": {"typical_opm": 25, "typical_roe": 10, "typical_de": 1.5},
    "Telecom": {"typical_opm": 35, "typical_roe": 8, "typical_de": 1.2},
    "Consumer Durables": {"typical_opm": 12, "typical_roe": 18, "typical_de": 0.3},
    "Financial Services": {"typical_opm": None, "typical_roe": 15, "typical_de": None},
    "Insurance": {"typical_opm": None, "typical_roe": 12, "typical_de": None},
    "Real Estate": {"typical_opm": 25, "typical_roe": 10, "typical_de": 0.8},
    "Healthcare": {"typical_opm": 15, "typical_roe": 14, "typical_de": 0.5},
    "Chemicals": {"typical_opm": 16, "typical_roe": 15, "typical_de": 0.4},
    "Construction": {"typical_opm": 10, "typical_roe": 14, "typical_de": 0.8},
    "Industrial": {"typical_opm": 12, "typical_roe": 14, "typical_de": 0.4},
    "Retail": {"typical_opm": 8, "typical_roe": 15, "typical_de": 0.5},
    "Internet": {"typical_opm": -5, "typical_roe": -10, "typical_de": 0.2},
    "Defence": {"typical_opm": 18, "typical_roe": 20, "typical_de": 0.3},
    "Mining": {"typical_opm": 30, "typical_roe": 20, "typical_de": 0.4},
    "Diversified": {"typical_opm": 10, "typical_roe": 12, "typical_de": 0.6},
    "Textiles": {"typical_opm": 12, "typical_roe": 12, "typical_de": 0.6},
    "Building Materials": {"typical_opm": 14, "typical_roe": 16, "typical_de": 0.3},
    "Logistics": {"typical_opm": 15, "typical_roe": 12, "typical_de": 0.5},
    "Travel": {"typical_opm": 30, "typical_roe": 25, "typical_de": 0.2},
    "Aviation": {"typical_opm": 12, "typical_roe": 15, "typical_de": 1.0},
    "Electronics": {"typical_opm": 10, "typical_roe": 18, "typical_de": 0.3},
}


def get_sector_peers(company_id: str, sector: str, companies: list[dict], top_n: int = 5) -> list[dict]:
    """Get top N peer companies in the same sector by market cap.
    If fewer than 5 in sector, expand to all available in that sector.
    """
    peers = [
        c for c in companies
        if c.get("sector") == sector and c.get("company_id") != company_id
    ]
    # Sort by market cap descending
    peers.sort(key=lambda c: c.get("market_cap", 0), reverse=True)
    return peers[:top_n]
