import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const DATA_DIR = path.join(process.cwd(), "Auditgpt-main", "backend", "data");
const REPORTS_DIR = path.join(DATA_DIR, "reports");
const COMPANIES_DIR = path.join(DATA_DIR, "companies");

function loadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

let reportsCache = null;
function getReports() {
  if (reportsCache) return reportsCache;
  const reports = {};
  if (fs.existsSync(REPORTS_DIR)) {
    const files = fs.readdirSync(REPORTS_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const data = loadJson(path.join(REPORTS_DIR, file));
        if (data && data.company_id) {
          reports[data.company_id] = data;
        }
      }
    }
  }
  reportsCache = reports;
  return reports;
}

function findReport(companyId) {
  const reports = getReports();
  if (reports[companyId]) return reports[companyId];
  const lower = companyId.toLowerCase();
  for (const cid in reports) {
    if (cid.toLowerCase() === lower) return reports[cid];
  }
  return null;
}

function buildPeerCompanies(companyId, sector, limit = 5) {
  const reports = getReports();
  const peers = [];
  for (const cid in reports) {
    const r = reports[cid];
    if (cid !== companyId && (r.sector || "") === sector) {
      peers.push({
        name: r.company_name,
        sector: r.sector || "",
        composite_score: r.composite_score || 0,
        fraud_risk: r.risk_level || "Low",
      });
    }
  }
  peers.sort((a, b) => b.composite_score - a.composite_score);
  return peers.slice(0, limit);
}

function buildRiskReasoning(report, beneish, altman, breakdown) {
  const parts = [];
  const m = beneish?.m_score;
  const z = altman?.z_score;
  if (m !== undefined && m !== null) {
    const flag = beneish.manipulation_likely ? "above manipulation threshold" : "below manipulation threshold";
    parts.push(`Beneish M-Score of ${m.toFixed(2)} (${flag})`);
  }
  if (z !== undefined && z !== null) {
    const zone = altman.zone || "unknown";
    parts.push(`Altman Z-Score of ${z.toFixed(2)} (${zone} zone)`);
  }
  const nFlags = report.red_flags?.length || 0;
  if (nFlags) {
    parts.push(`${nFlags} red flag${nFlags > 1 ? "s" : ""} detected`);
  }
  if (parts.length === 0) return "Insufficient data for detailed reasoning.";
  return parts.join(". ") + ".";
}

function buildFullReport(report, companyId) {
  const sector = report.sector || "";
  const peerCompanies = buildPeerCompanies(companyId, sector);
  const companyRaw = loadJson(path.join(COMPANIES_DIR, `${companyId}.json`)) || {};
  const financialData = {
    profit_loss: companyRaw.profit_loss || {},
    balance_sheet: companyRaw.balance_sheet || {},
    cash_flow: companyRaw.cash_flow || {},
    ratios: companyRaw.ratios || {},
  };
  const sentimentRaw = loadJson(path.join(REPORTS_DIR, `${companyId}_sentiment.json`)) || {};
  const sentimentTrend = sentimentRaw.sentiment_trend || {};
  const rptRaw = loadJson(path.join(DATA_DIR, "rpt", `${companyId}.json`));
  const auditorRaw = loadJson(path.join(DATA_DIR, "auditor_notes", `${companyId}.json`)) || {};
  const breakdown = report.breakdown || {};
  const beneish = report.beneish || {};
  const altman = report.altman || {};
  const riskReasoning = buildRiskReasoning(report, beneish, altman, breakdown);
  return {
    ...report,
    peer_companies: peerCompanies,
    financial_data: financialData,
    sentiment_trend: sentimentTrend,
    rpt_data: rptRaw,
    auditor_notes: auditorRaw,
    risk_reasoning: riskReasoning,
    fraud_risk_score: report.risk_level || "Low",
  };
}

// ==== API Routes ====

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/sectors", (req, res) => {
  const reports = getReports();
  const sectors: Record<string, { scores: number[]; count: number }> = {};
  for (const cid in reports) {
    const r = reports[cid];
    const sector = r.sector || "Unknown";
    if (!sectors[sector]) {
      sectors[sector] = { scores: [], count: 0 };
    }
    sectors[sector].scores.push(r.composite_score || 0);
    sectors[sector].count++;
  }
  const result = Object.entries(sectors).map(([name, data]) => {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    let risk = "Low";
    if (avg > 75) risk = "Critical";
    else if (avg > 50) risk = "High";
    else if (avg > 25) risk = "Medium";
    return { sector_name: name, avg_risk_score: Math.round(avg * 100) / 100, company_count: data.count, risk_level: risk };
  });
  result.sort((a, b) => b.avg_risk_score - a.avg_risk_score);
  res.json(result);
});

app.get("/api/sectors/:sector_name", (req, res) => {
  const reports = getReports();
  const sectorName = req.params.sector_name.replace(/%20/g, " ").toLowerCase();
  const companies = [];
  for (const cid in reports) {
    const r = reports[cid];
    if ((r.sector || "").toLowerCase() === sectorName) {
      companies.push({
        company_id: r.company_id,
        company_name: r.company_name,
        sector: r.sector || "",
        composite_score: r.composite_score || 0,
        risk_level: r.risk_level || "Low",
      });
    }
  }
  if (companies.length === 0) {
    return res.status(404).json({ detail: `Sector '${req.params.sector_name}' not found` });
  }
  companies.sort((a, b) => b.composite_score - a.composite_score);
  res.json(companies);
});

app.get("/api/search", (req, res) => {
  const q = (req.query.q as string) || "";
  if (q.length < 2) return res.json([]);
  const query = q.toLowerCase().trim();
  const reports = getReports();
  const results = [];
  for (const cid in reports) {
    const r = reports[cid];
    const name = (r.company_name || "").toLowerCase();
    const id = (r.company_id || "").toLowerCase();
    const sector = (r.sector || "").toLowerCase();
    if (!name.includes(query) && !id.includes(query) && !sector.includes(query)) continue;
    let score = 0;
    if (name.startsWith(query)) score = 3;
    else if (id.startsWith(query)) score = 2;
    else if (name.includes(query)) score = 1;
    results.push({
      company_id: r.company_id,
      company_name: r.company_name,
      sector: r.sector || "",
      composite_score: r.composite_score,
      risk_level: r.risk_level || "Low",
      _score: score,
    });
  }
  results.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    return a.company_name.localeCompare(b.company_name);
  });
  results.forEach(r => delete r._score);
  res.json(results.slice(0, 10));
});

app.get("/api/report/:company_id", (req, res) => {
  const companyId = req.params.company_id;
  const report: any = findReport(companyId);
  if (!report) {
    const reports = getReports();
    const suggestions = Object.values(reports).slice(0, 5).map((r: any) => ({
      company_id: r.company_id,
      company_name: r.company_name
    }));
    return res.status(404).json({
      detail: { message: `Company '${companyId}' not found`, suggestions }
    });
  }
  res.json(buildFullReport(report, report.company_id));
});

app.get("/api/stream/:company_id", (req, res) => {
  const report = findReport(req.params.company_id);
  if (!report) return res.status(404).json({ detail: "Company not found" });
  res.json({ narrative: report.narrative || "No narrative available" });
});

export default app;
