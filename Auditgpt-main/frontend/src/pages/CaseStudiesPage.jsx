import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CaseStudyReplay from "../components/CaseStudyReplay";
import { ALL_SCANDALS, SCANDAL_META } from "../data/scandalData";

const MO = "'JetBrains Mono', monospace";
const SA = "'Space Grotesk', sans-serif";

const Scanlines = () => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 3px)",
  }} />
);

// ─── SCANDAL SELECTOR CARD ────────────────────────────────────────────────────
function ScandalCard({ meta, isActive, onClick }) {
  const [hov, setHov] = useState(false);
  const scandal = ALL_SCANDALS.find(s => s.id === meta.id);
  const lastYear = scandal?.years?.[scandal.years.length - 1];
  const isCollapsed = lastYear?.isCollapse;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        all: "unset", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 12,
        background: isActive
          ? `linear-gradient(135deg,${meta.color}14,${meta.color}08)`
          : hov ? "#0d1422" : "#080c14",
        border: `1px solid ${isActive ? meta.color : hov ? meta.color + "55" : "#0d1622"}`,
        borderTop: `2px solid ${isActive ? meta.color : hov ? meta.color + "88" : "#1a2535"}`,
        borderRadius: 4,
        padding: "18px 20px",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        textAlign: "left",
      }}
    >
      {/* active glow */}
      {isActive && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at top left, ${meta.color}10, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* icon + country */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22 }}>{meta.icon}</span>
        <span style={{
          fontFamily: MO, fontSize: 8, color: isActive ? meta.color : "#3a4a60",
          background: isActive ? `${meta.color}14` : "#0a0e17",
          border: `1px solid ${isActive ? meta.color + "44" : "#141c28"}`,
          padding: "2px 8px", borderRadius: 2, letterSpacing: "0.1em",
        }}>{meta.country}</span>
      </div>

      {/* name */}
      <div>
        <div style={{
          fontFamily: SA, fontSize: 16, fontWeight: 700,
          color: isActive ? "#e4eefa" : hov ? "#c0cce0" : "#8898b0",
          marginBottom: 3, lineHeight: 1.2,
          transition: "color 0.2s",
        }}>{meta.label}</div>
        <div style={{
          fontFamily: MO, fontSize: 8, color: meta.color,
          letterSpacing: "0.08em", opacity: isActive ? 1 : 0.7,
        }}>{meta.year}</div>
      </div>

      {/* scale + type */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.06em" }}>SCALE</span>
          <span style={{ fontFamily: MO, fontSize: 11, fontWeight: 700, color: "#ff4455" }}>{meta.scale}</span>
        </div>
        <div style={{ fontFamily: SA, fontSize: 11, color: "#3a4a60", lineHeight: 1.4 }}>
          {meta.type}
        </div>
      </div>

      {/* active indicator */}
      {isActive && (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: MO, fontSize: 8, color: meta.color, letterSpacing: "0.1em",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
          VIEWING NOW
        </div>
      )}
    </button>
  );
}

// ─── PAGE HEADER STATS ────────────────────────────────────────────────────────
function HeaderStat({ label, value, color = "#00ff88" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: MO, fontSize: 20, fontWeight: 700, color,
        textShadow: `0 0 14px ${color}66`, lineHeight: 1, marginBottom: 4,
      }}>{value}</div>
      <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.12em" }}>{label}</div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function CaseStudiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [t, setT] = useState(new Date());

  const defaultId = searchParams.get("case") || "satyam";
  const [activeId, setActiveId] = useState(defaultId);

  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const selectCase = (id) => {
    setActiveId(id);
    setSearchParams({ case: id });
    // scroll replay into view smoothly
    setTimeout(() => {
      document.getElementById("replay-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const activeScandal = ALL_SCANDALS.find(s => s.id === activeId) || ALL_SCANDALS[0];
  const activeMeta = SCANDAL_META.find(m => m.id === activeId);

  const totalFraud = "~$120B+";
  const jobsLost = "~100,000+";
  const auditsFailed = "9";

  return (
    <div style={{ minHeight: "100vh", background: "#070b12", color: "#c0ccd8" }}>
      <Scanlines />

      {/* NAV */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200, height: 46,
        display: "flex", alignItems: "center", padding: "0 40px",
        background: "#070b12f2", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #0d1622",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginRight: 36 }}>
          <div style={{ width: 26, height: 26, borderRadius: 4, background: "linear-gradient(135deg,#00ff88,#00d4ff)", display: "grid", placeItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#070b12", fontFamily: SA }}>A</span>
          </div>
          <span style={{ fontFamily: SA, fontSize: 14, fontWeight: 700, color: "#c8d4e4", letterSpacing: "-0.01em" }}>
            Audit<span style={{ color: "#00ff88" }}>GPT</span>
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MO, fontSize: 10, color: "#2a3850" }}>
          <span onClick={() => navigate("/radar")} style={{ cursor: "pointer", transition: "color .15s" }}
            onMouseEnter={e => e.target.style.color = "#6a7a90"}
            onMouseLeave={e => e.target.style.color = "#2a3850"}>RADAR</span>
          <span style={{ color: "#141c28" }}>›</span>
          <span style={{ color: "#a855f7", letterSpacing: "0.08em" }}>CASE STUDIES</span>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: MO, fontSize: 9, textAlign: "right", lineHeight: 1.8 }}>
          <div style={{ color: "#00ff88" }}>{t.toLocaleTimeString("en-IN", { hour12: false })} IST</div>
          <div style={{ color: "#1e2838" }}>{t.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        </div>
      </header>

      {/* accent stripe */}
      <div style={{ height: 2, background: "linear-gradient(90deg,#a855f7 0%,#a855f744 40%,transparent 70%)" }} />

      <div style={{ padding: "32px 40px 100px" }}>

        {/* ── PAGE HERO ──────────────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg,#0a0e17,#080c14)",
          border: "1px solid #0d1622", borderTop: "2px solid #a855f7",
          borderRadius: 4, padding: "32px 36px", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -60, right: 40, width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(168,85,247,0.06) 0%,transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.22em", marginBottom: 10 }}>
                ◈ FORENSIC EDUCATION · REAL CASES · RECONSTRUCTED FROM FINANCIAL DATA
              </div>
              <h1 style={{
                fontFamily: SA, fontSize: 32, fontWeight: 800, color: "#e4eefa",
                margin: "0 0 10px", lineHeight: 1.05, letterSpacing: "-0.02em",
              }}>
                Corporate Fraud <span style={{ color: "#a855f7" }}>Case Studies</span>
              </h1>
              <p style={{
                fontFamily: SA, fontSize: 14, color: "#5a6a80", lineHeight: 1.75,
                margin: 0, maxWidth: 620,
              }}>
                Each scandal reconstructed year-by-year using the same quantitative models — Beneish M-Score and Altman Z-Score — that AuditGPT runs on live NSE companies today. The signals were always there. The gatekeepers weren't looking.
              </p>
            </div>

            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              <HeaderStat label="COMBINED FRAUD SCALE" value={totalFraud} color="#ff4455" />
              <div style={{ width: 1, height: 50, background: "#1a2535" }} />
              <HeaderStat label="JOBS DESTROYED" value={jobsLost} color="#ffb020" />
              <div style={{ width: 1, height: 50, background: "#1a2535" }} />
              <HeaderStat label="CLEAN AUDITS BEFORE COLLAPSE" value={auditsFailed} color="#a855f7" />
            </div>
          </div>
        </div>

        {/* ── SCANDAL SELECTOR GRID ──────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.22em", marginBottom: 14 }}>
            SELECT A CASE STUDY
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
            {SCANDAL_META.map(meta => (
              <ScandalCard
                key={meta.id}
                meta={meta}
                isActive={meta.id === activeId}
                onClick={() => selectCase(meta.id)}
              />
            ))}
          </div>
        </div>

        {/* ── ACTIVE CASE HEADER ─────────────────────────────────────────── */}
        <div id="replay-section" style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "14px 0 16px",
          borderTop: "1px solid #0d1622",
          marginBottom: 10,
        }}>
          <div style={{ width: 3, height: 36, borderRadius: 2, background: activeMeta?.color || "#a855f7" }} />
          <div>
            <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.18em", marginBottom: 4 }}>
              NOW VIEWING
            </div>
            <div style={{ fontFamily: SA, fontSize: 18, fontWeight: 700, color: "#d0dce8" }}>
              {activeMeta?.label} — {activeScandal?.title}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <div style={{
              fontFamily: MO, fontSize: 9, color: activeMeta?.color,
              background: `${activeMeta?.color}14`,
              border: `1px solid ${activeMeta?.color}44`,
              padding: "5px 12px", borderRadius: 3, letterSpacing: "0.1em",
            }}>{activeScandal?.fraudType}</div>
            <div style={{
              fontFamily: MO, fontSize: 9, color: "#ff4455",
              background: "rgba(255,68,85,0.1)",
              border: "1px solid rgba(255,68,85,0.3)",
              padding: "5px 12px", borderRadius: 3, letterSpacing: "0.1em",
            }}>{activeScandal?.fraudScale}</div>
          </div>
        </div>

        {/* ── REPLAY COMPONENT ───────────────────────────────────────────── */}
        <CaseStudyReplay scandal={activeScandal} />

        {/* ── LESSONS LEARNED ────────────────────────────────────────────── */}
        <div style={{
          marginTop: 14,
          background: "#080c14", border: "1px solid #0d1622",
          borderTop: "2px solid #2a3850",
          borderRadius: 4, padding: "24px 28px",
        }}>
          <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.22em", marginBottom: 14 }}>
            ◈ COMMON PATTERNS ACROSS ALL FIVE CASES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { label: "AUDITOR FAILURE", desc: "Arthur Andersen (Enron, WorldCom), PwC (Satyam), EY (Wirecard), KPMG/Big4 (IL&FS) — Big Four firms issued clean opinions for years during active fraud.", color: "#ff4455" },
              { label: "MODEL SIGNAL IGNORED", desc: "In every case, the Beneish M-Score or Altman Z-Score entered warning territory 2–5 years before collapse. The data was public. No analyst acted on it.", color: "#ffb020" },
              { label: "REGULATORY CAPTURE", desc: "BaFin pursued journalists instead of Wirecard. SEBI missed Satyam. SEC missed Enron for years. Rating agencies maintained AAA on IL&FS until default.", color: "#a855f7" },
              { label: "COMPLEXITY AS COVER", desc: "347 subsidiaries (IL&FS), 3,000 SPEs (Enron), 7,561 bank accounts (Satyam) — complexity is always a fraud enabler, not an excuse for missing it.", color: "#00d4ff" },
            ].map(({ label, desc, color }) => (
              <div key={label} style={{
                background: "#070b12", border: "1px solid #0d1622",
                borderLeft: `3px solid ${color}`,
                borderRadius: 3, padding: "14px 16px",
              }}>
                <div style={{ fontFamily: MO, fontSize: 9, color, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 8 }}>
                  {label}
                </div>
                <div style={{ fontFamily: SA, fontSize: 12, color: "#5a6a80", lineHeight: 1.7 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        body{margin:0;background:#070b12;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#060a10}
        ::-webkit-scrollbar-thumb{background:#141c28;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#1e2838}
      `}</style>
    </div>
  );
}
