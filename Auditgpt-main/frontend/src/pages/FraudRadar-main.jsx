import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api";

// ── helpers ────────────────────────────────────────────────────────────────
const riskMeta = (score) => {
  if (score <= 25) return { label: "LOW",      color: "#00ff88", glow: "0 0 12px #00ff8866", tier: 0 };
  if (score <= 50) return { label: "MEDIUM",   color: "#ffb020", glow: "0 0 12px #ffb02066", tier: 1 };
  if (score <= 75) return { label: "HIGH",     color: "#ff4455", glow: "0 0 12px #ff445566", tier: 2 };
  return              { label: "CRITICAL",  color: "#ff4455", glow: "0 0 20px #ff445599", tier: 3 };
};

const fmt = (n) => (n == null ? "—" : Math.round(n));

// ── Scanline overlay ───────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
  background: `repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.07) 2px,
    rgba(0,0,0,0.07) 4px
  )`,
};

// ── Mini score bar ─────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const m = riskMeta(score);
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 3, borderRadius: 2, background: "#1a1f2e", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`,
          background: m.color, boxShadow: m.glow, borderRadius: 2,
          transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)",
        }} />
      </div>
    </div>
  );
}

// ── Sector card ────────────────────────────────────────────────────────────
function SectorCard({ sector, avgScore, companyCount, onClick, isActive }) {
  const m = riskMeta(avgScore);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        all: "unset", cursor: "pointer", display: "block",
        background: isActive
          ? `linear-gradient(135deg, #1a1f2e 0%, #0f1420 100%)`
          : hovered ? "#141824" : "#0f1420",
        border: `1px solid ${isActive ? m.color : hovered ? "#2a3040" : "#1e2535"}`,
        borderLeft: `3px solid ${m.color}`,
        borderRadius: 4, padding: "18px 20px",
        transition: "all 0.18s ease",
        boxShadow: isActive
          ? `0 0 0 1px ${m.color}22, inset 0 0 30px ${m.color}08`
          : hovered ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 0, height: 0, borderStyle: "solid",
        borderWidth: "0 28px 28px 0",
        borderColor: `transparent ${m.color}33 transparent transparent`,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13, fontWeight: 600, color: "#c8d0e0",
          lineHeight: 1.3, maxWidth: "70%",
        }}>
          {sector}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 700, color: m.color,
          background: `${m.color}15`, border: `1px solid ${m.color}40`,
          padding: "2px 7px", borderRadius: 2, letterSpacing: "0.08em",
        }}>
          {m.label}
        </span>
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 26, fontWeight: 700, color: m.color,
        lineHeight: 1, textShadow: m.glow,
      }}>
        {fmt(avgScore)}
        <span style={{ fontSize: 12, color: "#4a5570", fontWeight: 400, marginLeft: 4 }}>/ 100</span>
      </div>

      <ScoreBar score={avgScore} />

      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 12,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#4a5570",
        letterSpacing: "0.05em",
      }}>
        <span>{companyCount} CO{companyCount !== 1 ? "S" : ""}</span>
      </div>
    </button>
  );
}

// ── Company row ────────────────────────────────────────────────────────────
function CompanyRow({ company, index, onClick }) {
  const m = riskMeta(company.composite_score ?? 0);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        all: "unset", cursor: "pointer", display: "flex",
        alignItems: "center", gap: 14, padding: "12px 16px",
        borderRadius: 3, background: hovered ? "#141824" : "transparent",
        borderBottom: "1px solid #1a1f2e", transition: "background 0.15s ease",
        width: "100%", boxSizing: "border-box",
      }}
    >
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#2a3a50", minWidth: 20, textAlign: "right" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div style={{
        minWidth: 44, textAlign: "center",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700,
        color: m.color, background: `${m.color}15`, border: `1px solid ${m.color}35`,
        borderRadius: 3, padding: "3px 6px",
      }}>
        {fmt(company.composite_score)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
          color: hovered ? "#e0e8f0" : "#b0bac8",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {company.company_name}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4560", marginTop: 2, letterSpacing: "0.06em" }}>
          {company.company_id}
        </div>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, color: m.color, opacity: 0.7, letterSpacing: "0.1em" }}>
        {m.label}
      </span>
      <span style={{ color: "#2a3a50", fontSize: 10 }}>›</span>
    </button>
  );
}

// ── Search bar ─────────────────────────────────────────────────────────────
function SearchBar({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const showDropdown = focused && (results.length > 0 || (loading && query));

  return (
    <div style={{ position: "relative", maxWidth: 520, width: "100%" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#0f1420",
        border: `1px solid ${focused ? "#00ff8855" : "#2a3040"}`,
        borderRadius: 4, padding: "10px 14px",
        boxShadow: focused ? "0 0 0 1px #00ff8822, 0 4px 24px rgba(0,255,136,0.06)" : "none",
        transition: "all 0.2s ease",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? "#00ff88" : "#3a4560"} strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search company or ticker…"
          style={{
            all: "unset", flex: 1,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13, color: "#c8d8e8", letterSpacing: "0.02em",
          }}
        />
        {loading && (
          <div style={{
            width: 12, height: 12, border: "2px solid #1a2535",
            borderTop: "2px solid #00ff88", borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }} />
        )}
        {query && !loading && (
          <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            style={{ all: "unset", cursor: "pointer", color: "#3a4560", fontSize: 16, lineHeight: 1 }}>
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#0d1118", border: "1px solid #2a3040", borderRadius: 4,
          overflow: "hidden", zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}>
          {results.map((r, i) => {
            const m = riskMeta(r.composite_score ?? 0);
            return (
              <button
                key={r.company_id}
                onMouseDown={() => onNavigate(r.company_id)}
                style={{
                  all: "unset", display: "flex", alignItems: "center", gap: 12,
                  width: "100%", boxSizing: "border-box", padding: "10px 14px",
                  cursor: "pointer",
                  borderBottom: i < results.length - 1 ? "1px solid #1a1f2e" : "none",
                  background: "transparent", transition: "background 0.1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#141824"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: m.color, minWidth: 34 }}>
                  {fmt(r.composite_score)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: "#c8d8e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.company_name}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4560", marginTop: 1 }}>
                    {r.company_id} · {r.sector}
                  </div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: m.color, opacity: 0.6, letterSpacing: "0.1em" }}>
                  {m.label}
                </span>
              </button>
            );
          })}
          {results.length === 0 && loading && (
            <div style={{ padding: "16px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3a4560", textAlign: "center" }}>
              Scanning NSE database…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Company panel (slide-in) ───────────────────────────────────────────────
function CompanyPanel({ sectorName, onClose, onNavigate }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/sectors/${encodeURIComponent(sectorName)}`)
      .then((r) => r.json())
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : data.companies ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sectorName]);

  const critCount = companies.filter((c) => (c.composite_score ?? 0) > 75).length;
  const highCount = companies.filter((c) => (c.composite_score ?? 0) > 50 && (c.composite_score ?? 0) <= 75).length;

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0,
      width: 360, background: "#0a0d14",
      borderLeft: "1px solid #1e2535",
      zIndex: 50, display: "flex", flexDirection: "column",
      animation: "slideIn 0.22s cubic-bezier(0.23,1,0.32,1)",
      boxShadow: "-12px 0 40px rgba(0,0,0,0.6)",
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1a1f2e", background: "#0d1018" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4560", letterSpacing: "0.15em", marginBottom: 6 }}>
              SECTOR DRILL-DOWN
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#d0dae8", lineHeight: 1.2, maxWidth: 260 }}>
              {sectorName}
            </div>
          </div>
          <button onClick={onClose} style={{ all: "unset", cursor: "pointer", color: "#3a4560", fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        {!loading && (
          <div style={{ display: "flex", gap: 12, marginTop: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            <span style={{ color: "#4a5570" }}>{companies.length} companies</span>
            {critCount > 0 && <span style={{ color: "#ff4455" }}>▲ {critCount} critical</span>}
            {highCount > 0 && <span style={{ color: "#ffb020" }}>▲ {highCount} high</span>}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #1a2535", borderTop: "2px solid #00ff88", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4560" }}>Loading companies…</span>
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4560" }}>
            No company data available.
          </div>
        ) : (
          companies.map((c, i) => (
            <CompanyRow key={c.company_id} company={c} index={i} onClick={() => onNavigate(c.company_id)} />
          ))
        )}
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid #1a1f2e", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a3548", textAlign: "center", letterSpacing: "0.08em" }}>
        CLICK COMPANY → FULL FORENSIC REPORT
      </div>
    </div>
  );
}

// ── Risk distribution strip ────────────────────────────────────────────────
function RiskStrip({ sectors }) {
  const counts = { low: 0, med: 0, high: 0, crit: 0 };
  // FIX: use avg_risk_score (correct API field)
  sectors.forEach(({ avg_risk_score: s }) => {
    if (s <= 25) counts.low++;
    else if (s <= 50) counts.med++;
    else if (s <= 75) counts.high++;
    else counts.crit++;
  });
  const total = sectors.length || 1;
  const bars = [
    { key: "low",  label: "LOW",      count: counts.low,  color: "#00ff88" },
    { key: "med",  label: "MEDIUM",   count: counts.med,  color: "#ffb020" },
    { key: "high", label: "HIGH",     count: counts.high, color: "#ff4455" },
    { key: "crit", label: "CRITICAL", count: counts.crit, color: "#ff4455" },
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", gap: 1, marginBottom: 8 }}>
        {bars.map((b) => (
          <div key={b.key} style={{
            flex: b.count / total, background: b.color,
            opacity: b.key === "crit" ? 1 : 0.6,
            minWidth: b.count > 0 ? 4 : 0,
            transition: "flex 0.6s ease",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {bars.map((b) => (
          <div key={b.key} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: b.count > 0 ? b.color : "#2a3040", letterSpacing: "0.08em" }}>
            <span style={{ opacity: 0.5 }}>{b.label} </span>
            <span style={{ fontWeight: 700 }}>{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function FraudRadar() {
  const navigate = useNavigate();
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSector, setActiveSector] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(`${API}/sectors`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((data) => {
        // FIX: handle both array and wrapped { sectors: [] } shapes
        setSectors(Array.isArray(data) ? data : data.sectors ?? []);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const handleNavigate = (companyId) => navigate(`/report/${companyId}`);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour12: false });
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#070b12", color: "#c8d0e0", fontFamily: "'JetBrains Mono', monospace", paddingBottom: 80 }}>
      <div style={overlayStyle} />

      {/* NAV */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "#070b12cc", backdropFilter: "blur(10px)",
        borderBottom: "1px solid #1a1f2e", padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 52,
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 3, background: "linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#070b12", fontFamily: "'Space Grotesk', sans-serif" }}>A</span>
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: "#e0eaf4", letterSpacing: "0.02em" }}>
              Audit<span style={{ color: "#00ff88" }}>GPT</span>
            </span>
          </div>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "#3a4560" }}>
          <span>NSE</span><span>›</span><span style={{ color: "#00ff88" }}>FRAUD RADAR</span>
        </div>
        <div style={{ textAlign: "right", fontSize: 9, lineHeight: 1.5 }}>
          <div style={{ color: "#00ff88", letterSpacing: "0.1em" }}>{timeStr} IST</div>
          <div style={{ color: "#3a4560" }}>{dateStr}</div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "40px 32px 0",
        marginRight: activeSector ? "360px" : "auto",
        transition: "margin-right 0.22s cubic-bezier(0.23,1,0.32,1)",
      }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4560", letterSpacing: "0.2em", marginBottom: 8 }}>
              NSE · FORENSIC INTELLIGENCE · SECTOR OVERVIEW
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: "#e0eaf4", margin: 0, lineHeight: 1.1 }}>
              Fraud <span style={{ color: "#00ff88", textShadow: "0 0 20px #00ff8860" }}>Radar</span>
            </h1>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4560", marginTop: 6 }}>
              {loading ? "Scanning…" : `${sectors.length} sectors · composite M-Score + Altman Z + peer-adjusted anomaly`}
            </div>
          </div>
          <SearchBar onNavigate={handleNavigate} />
        </div>

        {error && (
          <div style={{ background: "#1a0a0e", border: "1px solid #ff445544", borderLeft: "3px solid #ff4455", borderRadius: 4, padding: "14px 18px", marginBottom: 28, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ff7788" }}>
            ⚠ Backend unreachable — {error}.
            <span style={{ color: "#5a3040", marginLeft: 6 }}>Start: cd backend && uvicorn main:app --reload --port 8000</span>
          </div>
        )}

        {!loading && sectors.length > 0 && <RiskStrip sectors={sectors} />}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ height: 118, background: "#0f1420", borderRadius: 4, border: "1px solid #1a1f2e", animation: `pulse 1.4s ease-in-out ${i * 0.08}s infinite` }} />
            ))}
          </div>
        ) : sectors.length === 0 && !error ? (
          <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3a4560", lineHeight: 2 }}>
            No sector data found.<br />
            <span style={{ color: "#2a3548" }}>Run: python scripts/precompute.py</span>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {sectors.map((s) => (
              <SectorCard
                key={s.sector_name}
                sector={s.sector_name}           // FIX: was s.sector
                avgScore={s.avg_risk_score ?? 0} // FIX: was s.avg_composite_score
                companyCount={s.company_count ?? 0}
                isActive={activeSector === s.sector_name}
                onClick={() => setActiveSector(activeSector === s.sector_name ? null : s.sector_name)}
              />
            ))}
          </div>
        )}

        {!loading && sectors.length > 0 && (
          <div style={{ display: "flex", gap: 24, marginTop: 28, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4560", flexWrap: "wrap" }}>
            {[
              { color: "#00ff88", label: "0–25 LOW RISK" },
              { color: "#ffb020", label: "26–50 MEDIUM" },
              { color: "#ff4455", label: "51–75 HIGH" },
              { color: "#ff4455", label: "76–100 CRITICAL", bold: true },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: l.color, opacity: l.bold ? 1 : 0.5 }} />
                <span style={{ fontWeight: l.bold ? 700 : 400 }}>{l.label}</span>
              </div>
            ))}
            <span style={{ marginLeft: "auto" }}>CLICK SECTOR → COMPANY LIST</span>
          </div>
        )}
      </div>

      {activeSector && (
        <CompanyPanel
          sectorName={activeSector}
          onClose={() => setActiveSector(null)}
          onNavigate={handleNavigate}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #070b12; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0d14; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a3548; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}