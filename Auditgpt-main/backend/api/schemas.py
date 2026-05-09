from pydantic import BaseModel


class Citation(BaseModel):
    filing_year: int
    filing_type: str  # "Balance Sheet" | "P&L" | "Cash Flow" | "Auditor Report"
    metric_name: str
    reported_value: float
    source: str


class RedFlag(BaseModel):
    flag_type: str
    severity: str  # "Low" | "Medium" | "High" | "Critical"
    first_appeared: int
    evolution: list[str]
    industry_context: str
    citation: Citation


class PeerCompany(BaseModel):
    name: str
    sector: str
    composite_score: float
    fraud_risk: str


class ForensicReport(BaseModel):
    company_name: str
    company_id: str
    cin: str | None = None
    sector: str
    fraud_risk_score: str  # "Low" | "Medium" | "High" | "Critical"
    composite_score: float  # 0-100
    risk_reasoning: str
    red_flags: list[RedFlag]
    anomaly_map: dict  # {metric: {year: z_score}}
    sentiment_trend: dict  # {year: sentiment_score}
    peer_companies: list[PeerCompany]
    rpt_data: dict | None = None
    narrative: str | None = None
    financial_data: dict = {}  # raw financial data for charts


class SectorSummary(BaseModel):
    sector_name: str
    avg_risk_score: float
    company_count: int
    risk_level: str  # "Low" | "Medium" | "High" | "Critical"


class SearchResult(BaseModel):
    company_id: str
    company_name: str
    sector: str
    composite_score: float | None = None
