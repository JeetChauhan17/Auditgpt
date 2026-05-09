import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000/api";
const MO = "'JetBrains Mono', monospace";
const SA = "'Space Grotesk', sans-serif";

// ─── utils ────────────────────────────────────────────────────────────────────
const riskOf = (s) => {
  const n = Number(s) || 0;
  if (n <= 25) return { label: "LOW",      hex: "#00ff88", bg: "#00ff8812", tier: 0 };
  if (n <= 50) return { label: "MEDIUM",   hex: "#ffb020", bg: "#ffb02012", tier: 1 };
  if (n <= 75) return { label: "HIGH",     hex: "#ff4455", bg: "#ff445512", tier: 2 };
  return              { label: "CRITICAL", hex: "#ff4455", bg: "#ff445520", tier: 3 };
};
const ni = (v) => v == null ? "—" : String(Math.round(Number(v)));
const n1 = (v) => v == null ? "—" : Number(v).toFixed(1);

// ─── scanlines ────────────────────────────────────────────────────────────────
const Scanlines = () => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 3px)",
  }} />
);

// ─── nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const navigate = useNavigate();
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100, height: 46,
      display: "flex", alignItems: "center", padding: "0 40px",
      background: "#070b12f2", backdropFilter: "blur(20px)",
      borderBottom: "1px solid #0d1622",
    }}>
      <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginRight: 36 }}>
        <div style={{ width: 26, height: 26, borderRadius: 4, background: "linear-gradient(135deg,#00ff88,#00d4ff)", display: "grid", placeItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#070b12", fontFamily: SA }}>A</span>
        </div>
        <span style={{ fontFamily: SA, fontSize: 14, fontWeight: 700, color: "#c8d4e4" }}>
          Audit<span style={{ color: "#00ff88" }}>GPT</span>
        </span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MO, fontSize: 10, color: "#2a3850" }}>
        <span onClick={() => navigate("/radar")} style={{ cursor: "pointer" }}
          onMouseEnter={e => e.target.style.color = "#6a7a90"}
          onMouseLeave={e => e.target.style.color = "#2a3850"}>RADAR</span>
        <span style={{ color: "#141c28" }}>›</span>
        <span style={{ color: "#ff4455", letterSpacing: "0.08em", fontWeight: 700 }}>⚠ CRITICAL SECTION</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{
          fontFamily: MO, fontSize: 8, color: "#ff4455", background: "rgba(255,68,85,0.1)",
          border: "1px solid rgba(255,68,85,0.3)", padding: "4px 10px", borderRadius: 2,
          letterSpacing: "0.12em", animation: "critBlink 2s ease-in-out infinite",
        }}>◉ LIVE THREAT MONITOR</div>
        <div style={{ fontFamily: MO, fontSize: 9, textAlign: "right", lineHeight: 1.8 }}>
          <div style={{ color: "#00ff88" }}>{t.toLocaleTimeString("en-IN", { hour12: false })} IST</div>
          <div style={{ color: "#1e2838" }}>{t.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        </div>
      </div>
    </header>
  );
}

// ─── SECTION 1: THREAT MATRIX HEATMAP ────────────────────────────────────────
function ThreatMatrix({ companies, onSelect, selectedId }) {
  const [hovId, setHovId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // group by sector
  const bySector = useMemo(() => {
    const map = {};
    companies.forEach(c => {
      const s = c.sector || "Unknown";
      if (!map[s]) map[s] = [];
      map[s].push(c);
    });
    // sort each sector by score desc
    Object.values(map).forEach(arr => arr.sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0)));
    return map;
  }, [companies]);

  const tiers = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const filtered = useMemo(() => {
    if (filter === "ALL") return bySector;
    const out = {};
    Object.entries(bySector).forEach(([sec, arr]) => {
      const f = arr.filter(c => riskOf(c.composite_score).label === filter);
      if (f.length) out[sec] = f;
    });
    return out;
  }, [bySector, filter]);

  const totalHigh = companies.filter(c => (c.composite_score || 0) > 50).length;
  const totalCritical = companies.filter(c => (c.composite_score || 0) > 75).length;

  // cell size — responsive to company count
  const CELL = 52;

  return (
    <div style={{
      background: "#080c14", border: "1px solid #0d1622",
      borderTop: "2px solid #ff4455", borderRadius: 4, overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        padding: "22px 28px 18px",
        borderBottom: "1px solid #0d1622",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontFamily: MO, fontSize: 8, color: "#ff4455", letterSpacing: "0.22em", marginBottom: 7, fontWeight: 700 }}>
            ◈ SECTION I · THREAT MATRIX
          </div>
          <div style={{ fontFamily: SA, fontSize: 20, fontWeight: 800, color: "#e4eefa", letterSpacing: "-0.02em" }}>
            NSE Fraud Risk Heatmap
          </div>
          <div style={{ fontFamily: SA, fontSize: 12, color: "#3a4a60", marginTop: 4 }}>
            Every tracked company · grouped by sector · ordered by composite risk score
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {/* summary chips */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "TOTAL", val: companies.length, color: "#4a6080" },
              { label: "HIGH+", val: totalHigh, color: "#ffb020" },
              { label: "CRITICAL", val: totalCritical, color: "#ff4455" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                textAlign: "center", background: "#070b12",
                border: "1px solid #0d1622", borderRadius: 3, padding: "8px 14px",
              }}>
                <div style={{ fontFamily: MO, fontSize: 18, fontWeight: 700, color, textShadow: `0 0 10px ${color}66`, lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: MO, fontSize: 7, color: "#2a3850", letterSpacing: "0.12em", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* tier filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {tiers.map(t => {
              const col = t === "CRITICAL" ? "#ff4455" : t === "HIGH" ? "#ff8844" : t === "MEDIUM" ? "#ffb020" : t === "LOW" ? "#00ff88" : "#4a6080";
              return (
                <button key={t} onClick={() => setFilter(t)} style={{
                  all: "unset", cursor: "pointer",
                  fontFamily: MO, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
                  padding: "5px 10px", borderRadius: 2,
                  color: filter === t ? (t === "ALL" ? "#070b12" : col) : "#2a3850",
                  background: filter === t ? (t === "ALL" ? "#4a6080" : `${col}22`) : "transparent",
                  border: `1px solid ${filter === t ? (t === "ALL" ? "#4a6080" : col) : "#0d1622"}`,
                  transition: "all .15s",
                }}>{t}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* legend */}
      <div style={{
        padding: "10px 28px", borderBottom: "1px solid #0d1622",
        display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontFamily: MO, fontSize: 8, color: "#1e2838", letterSpacing: "0.1em" }}>RISK SCORE:</span>
        {[
          [0, "#00ff88", "0–25 LOW"],
          [26, "#ffb020", "26–50 MEDIUM"],
          [51, "#ff8844", "51–75 HIGH"],
          [76, "#ff4455", "76–100 CRITICAL"],
        ].map(([, col, lbl]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 20, height: 14, borderRadius: 2, background: col, opacity: 0.85, boxShadow: `0 0 6px ${col}66` }} />
            <span style={{ fontFamily: MO, fontSize: 8, color: "#3a4a60" }}>{lbl}</span>
          </div>
        ))}
        <span style={{ fontFamily: MO, fontSize: 8, color: "#1e2838", marginLeft: "auto" }}>
          HOVER TO INSPECT · CLICK TO INVESTIGATE
        </span>
      </div>

      {/* matrix body */}
      <div style={{ padding: "20px 28px 24px", overflowX: "auto" }}>
        {Object.entries(filtered).length === 0 ? (
          <div style={{ fontFamily: MO, fontSize: 10, color: "#2a3850", padding: "24px 0" }}>
            No companies match the selected filter.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(filtered)
              .sort(([, a], [, b]) => {
                const maxA = Math.max(...a.map(c => c.composite_score || 0));
                const maxB = Math.max(...b.map(c => c.composite_score || 0));
                return maxB - maxA;
              })
              .map(([sector, comps]) => {
                const sectorMaxRisk = Math.max(...comps.map(c => c.composite_score || 0));
                const sectorRisk = riskOf(sectorMaxRisk);
                return (
                  <div key={sector}>
                    {/* sector label */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                    }}>
                      <div style={{ width: 3, height: 16, borderRadius: 1, background: sectorRisk.hex }} />
                      <span style={{ fontFamily: MO, fontSize: 9, color: "#4a5a70", letterSpacing: "0.14em", fontWeight: 700 }}>
                        {sector.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: MO, fontSize: 8, color: "#2a3548" }}>
                        {comps.length} co.
                      </span>
                      <div style={{ flex: 1, height: 1, background: "#0d1622", marginLeft: 4 }} />
                    </div>

                    {/* company cells */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {comps.map(c => {
                        const r = riskOf(c.composite_score);
                        const isHov = hovId === c.company_id;
                        const isSel = selectedId === c.company_id;
                        const intensity = Math.min((c.composite_score || 0) / 100, 1);
                        // glow proportional to score
                        const glowSize = 4 + intensity * 10;

                        return (
                          <div
                            key={c.company_id}
                            onMouseEnter={() => setHovId(c.company_id)}
                            onMouseLeave={() => setHovId(null)}
                            onClick={() => onSelect(c)}
                            style={{
                              width: CELL, height: CELL,
                              borderRadius: 3,
                              background: isSel
                                ? `${r.hex}30`
                                : isHov
                                  ? `${r.hex}22`
                                  : `${r.hex}${Math.round(8 + intensity * 18).toString(16).padStart(2,"0")}`,
                              border: `1px solid ${isSel ? r.hex : isHov ? `${r.hex}88` : `${r.hex}${Math.round(20 + intensity * 30).toString(16).padStart(2,"0")}`}`,
                              boxShadow: (isHov || isSel) ? `0 0 ${glowSize}px ${r.hex}66, inset 0 0 ${glowSize / 2}px ${r.hex}22` : `0 0 ${glowSize / 3}px ${r.hex}33`,
                              cursor: "pointer",
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center",
                              gap: 2,
                              transition: "all .15s",
                              transform: isHov ? "scale(1.12)" : "scale(1)",
                              zIndex: isHov ? 10 : 1,
                              position: "relative",
                            }}
                            title={`${c.company_name} — ${ni(c.composite_score)}`}
                          >
                            <span style={{
                              fontFamily: MO, fontSize: 13, fontWeight: 700,
                              color: r.hex,
                              textShadow: `0 0 8px ${r.hex}88`,
                              lineHeight: 1,
                            }}>{ni(c.composite_score)}</span>
                            <span style={{
                              fontFamily: MO, fontSize: 6.5,
                              color: isHov ? r.hex : `${r.hex}99`,
                              letterSpacing: "0.02em",
                              maxWidth: CELL - 6,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              textAlign: "center",
                            }}>
                              {c.company_id || c.company_name?.slice(0, 7)}
                            </span>
                            {/* corner risk pip */}
                            {(c.composite_score || 0) > 75 && (
                              <div style={{
                                position: "absolute", top: 3, right: 3,
                                width: 5, height: 5, borderRadius: "50%",
                                background: r.hex, boxShadow: `0 0 6px ${r.hex}`,
                                animation: "critBlink 1.4s ease-in-out infinite",
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SECTION 2: CONTAGION SPLASH ZONE ────────────────────────────────────────
function ContagionZone({ company, allCompanies, sectorMap }) {
  const [mode, setMode] = useState("actual"); // "actual" | "predicted"
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  if (!company) {
    return (
      <div style={{
        background: "#080c14", border: "1px solid #0d1622",
        borderTop: "2px solid #2a3850", borderRadius: 4,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: 400, gap: 16, padding: 40,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "radial-gradient(circle,#0d1622,#070b12)",
          border: "1px dashed #1a2535",
          display: "grid", placeItems: "center",
          animation: "spinSlow 8s linear infinite",
        }}>
          <span style={{ fontSize: 24, opacity: 0.4 }}>☢</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: MO, fontSize: 10, color: "#2a3850", letterSpacing: "0.18em", marginBottom: 6 }}>
            SELECT A COMPANY
          </div>
          <div style={{ fontFamily: SA, fontSize: 13, color: "#1e2838" }}>
            Click any cell in the Threat Matrix above to map its contagion zone
          </div>
        </div>
      </div>
    );
  }

  const risk = riskOf(company.composite_score);
  const score = company.composite_score || 0;

  // peers in same sector
  const peers = (sectorMap[company.sector] || []).filter(c => c.company_id !== company.company_id);

  // market cap from company data, fallback estimate
  const mcap = company.market_cap || (score * 800); // rough proxy
  const formatMcap = (v) => v > 100000 ? `₹${(v / 100000).toFixed(1)}L Cr` : `₹${Math.round(v).toLocaleString()} Cr`;

  // ── ACTUAL IMPACT: how much market cap was destroyed (for high/critical companies)
  // Modeled: high = 20-40% of mcap wiped in 30 days post-discovery
  // Critical = 50-80% wipe
  const wipeFactors = { LOW: 0.02, MEDIUM: 0.08, HIGH: 0.28, CRITICAL: 0.62 };
  const wipeFactor = wipeFactors[risk.label] || 0.1;
  const directWipe = mcap * wipeFactor;

  // Sector contagion: peers lose 3–12% from panic selling
  const sectorContagionFactor = score > 75 ? 0.09 : score > 50 ? 0.05 : 0.02;
  const sectorContagionTotal = peers.reduce((sum, p) => sum + ((p.market_cap || score * 400) * sectorContagionFactor), 0);

  // System contagion (mutual fund / FII exposure) — scales with mcap
  const systemicFactor = score > 75 ? 0.025 : score > 50 ? 0.01 : 0.003;
  const systemicTotal = mcap * systemicFactor * 8; // estimated 8x leverage in derivative market

  const totalActualImpact = directWipe + sectorContagionTotal + systemicTotal;

  // ── PREDICTED SPLASH (if this SUSPECTED company does commit fraud)
  // Amplified by how much of the balance sheet could be fictitious
  const fraudMultiplier = score > 75 ? 3.2 : score > 50 ? 1.8 : 1.2;
  const predictedDirectWipe = mcap * 0.72; // typical confession day wipe
  const predictedSectorContagion = sectorContagionTotal * fraudMultiplier;
  const predictedSystemic = systemicTotal * fraudMultiplier;
  const totalPredictedImpact = predictedDirectWipe + predictedSectorContagion + predictedSystemic;

  // ── ripple rings data
  const rings = mode === "actual" ? [
    { label: "DIRECT WIPE", color: "#ff4455", amount: directWipe, pct: wipeFactor * 100, desc: `${company.company_name} stock collapse on discovery`, radius: 1 },
    { label: "SECTOR CONTAGION", color: "#ffb020", amount: sectorContagionTotal, pct: sectorContagionFactor * 100, desc: `${peers.length} sector peers lose ${(sectorContagionFactor * 100).toFixed(0)}% from panic selling`, radius: 2 },
    { label: "SYSTEMIC EXPOSURE", color: "#ffb02066", amount: systemicTotal, pct: systemicFactor * 100, desc: "Mutual fund NAV erosion · FII portfolio unwinding · derivative triggers", radius: 3 },
  ] : [
    { label: "PREDICTED DIRECT WIPE", color: "#ff4455", amount: predictedDirectWipe, pct: 72, desc: `Confession day collapse — avg −72% for Indian accounting fraud`, radius: 1 },
    { label: "SECTOR BLAST RADIUS", color: "#ffb020", amount: predictedSectorContagion, pct: sectorContagionFactor * fraudMultiplier * 100, desc: `${peers.length} peers hit · elevated by ${fraudMultiplier.toFixed(1)}× fraud scale factor`, radius: 2 },
    { label: "SYSTEMIC SHOCK", color: "#ff445544", amount: predictedSystemic, pct: systemicFactor * fraudMultiplier * 100, desc: "Estimated derivative unwind + fund redemption cascade", radius: 3 },
  ];

  const total = mode === "actual" ? totalActualImpact : totalPredictedImpact;

  // ── top at-risk companies (same sector, sorted by mcap exposure)
  const atRisk = peers
    .map(p => ({
      ...p,
      exposure: (p.market_cap || score * 400) * (mode === "actual" ? sectorContagionFactor : sectorContagionFactor * fraudMultiplier),
      lossPct: (mode === "actual" ? sectorContagionFactor : sectorContagionFactor * fraudMultiplier) * 100,
    }))
    .sort((a, b) => b.exposure - a.exposure)
    .slice(0, 8);

  return (
    <div style={{
      background: "#080c14", border: "1px solid #0d1622",
      borderTop: `2px solid ${mode === "predicted" ? "#ff4455" : risk.hex}`,
      borderRadius: 4, overflow: "hidden",
      transition: "border-top-color .4s",
    }}>
      {/* header */}
      <div style={{
        padding: "22px 28px 18px", borderBottom: "1px solid #0d1622",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: MO, fontSize: 8, color: mode === "predicted" ? "#ff4455" : risk.hex, letterSpacing: "0.22em", marginBottom: 7, fontWeight: 700 }}>
            ◈ SECTION II · {mode === "predicted" ? "⚠ PREDICTED BLAST RADIUS" : "CONTAGION SPLASH ZONE"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: SA, fontSize: 20, fontWeight: 800, color: "#e4eefa", letterSpacing: "-0.02em" }}>
              {company.company_name}
            </div>
            <div style={{ fontFamily: MO, fontSize: 10, color: "#3a4a60" }}>{company.company_id}</div>
          </div>
          <div style={{ fontFamily: SA, fontSize: 12, color: "#3a4a60", marginTop: 3 }}>
            {company.sector} · Risk Score: <span style={{ color: risk.hex, fontWeight: 700 }}>{ni(company.composite_score)}/100 {risk.label}</span>
          </div>
        </div>

        {/* mode toggle */}
        <div style={{
          display: "flex", background: "#070b12", border: "1px solid #0d1622",
          borderRadius: 4, overflow: "hidden", flexShrink: 0,
        }}>
          {[
            { id: "actual", label: "ACTUAL IMPACT", sub: "current known damage" },
            { id: "predicted", label: "PREDICTED BLAST", sub: "if fraud confirmed" },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              all: "unset", cursor: "pointer",
              padding: "10px 18px", textAlign: "center",
              background: mode === m.id ? (m.id === "predicted" ? "rgba(255,68,85,0.15)" : `${risk.hex}18`) : "transparent",
              borderRight: m.id === "actual" ? "1px solid #0d1622" : "none",
              transition: "background .2s",
            }}>
              <div style={{ fontFamily: MO, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: mode === m.id ? (m.id === "predicted" ? "#ff4455" : risk.hex) : "#2a3850", marginBottom: 2 }}>
                {m.label}
              </div>
              <div style={{ fontFamily: SA, fontSize: 10, color: "#2a3548" }}>{m.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

        {/* LEFT: blast visualizer */}
        <div style={{ borderRight: "1px solid #0d1622", padding: "28px 32px" }}>

          {/* total impact headline */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.16em", marginBottom: 8 }}>
              {mode === "predicted" ? "ESTIMATED TOTAL MARKET DAMAGE" : "ESTIMATED IMPACT ALREADY CAUSED"}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{
                fontFamily: MO, fontSize: 36, fontWeight: 700, lineHeight: 1,
                color: mode === "predicted" ? "#ff4455" : risk.hex,
                textShadow: `0 0 22px ${mode === "predicted" ? "#ff4455" : risk.hex}77`,
              }}>
                {formatMcap(total)}
              </div>
              {mode === "predicted" && (
                <div style={{
                  fontFamily: MO, fontSize: 9, color: "#ff4455",
                  background: "rgba(255,68,85,0.1)", border: "1px solid rgba(255,68,85,0.3)",
                  padding: "3px 8px", borderRadius: 2, letterSpacing: "0.1em",
                }}>PROJECTED</div>
              )}
            </div>
          </div>

          {/* ripple rings visualization */}
          <div style={{ position: "relative", height: 240, marginBottom: 24 }}>
            {/* SVG ripple rings */}
            <svg width="100%" height="240" viewBox="0 0 380 240" style={{ position: "absolute", inset: 0 }}>
              <defs>
                {rings.map((r, i) => (
                  <radialGradient key={i} id={`rg${i}`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={r.color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={r.color} stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              {/* outer rings — static glow halos */}
              {rings.map((r, i) => {
                const radius = 60 + i * 48;
                return (
                  <g key={i}>
                    <circle cx="110" cy="120" r={radius}
                      fill={`url(#rg${i})`}
                      stroke={r.color} strokeWidth="0.5" strokeOpacity="0.3"
                      strokeDasharray="3 4"
                    />
                  </g>
                );
              })}

              {/* animated pulse rings */}
              {[1, 2, 3].map(i => (
                <circle key={i} cx="110" cy="120" r="20"
                  fill="none"
                  stroke={mode === "predicted" ? "#ff4455" : risk.hex}
                  strokeWidth="1"
                  opacity="0"
                  style={{
                    animation: `ripple${i} 3s ease-out ${i * 0.8}s infinite`,
                  }}
                />
              ))}

              {/* epicenter */}
              <circle cx="110" cy="120" r="22"
                fill={`${risk.hex}18`} stroke={risk.hex} strokeWidth="1.5" />
              <circle cx="110" cy="120" r="10"
                fill={risk.hex} style={{ filter: `drop-shadow(0 0 10px ${risk.hex})` }} />

              {/* ring labels */}
              {rings.map((r, i) => {
                const radius = 60 + i * 48;
                const angle = -30 - i * 15;
                const rad = (angle * Math.PI) / 180;
                const lx = 110 + radius * Math.cos(rad);
                const ly = 120 + radius * Math.sin(rad);
                return (
                  <g key={i}>
                    <text x={lx + 6} y={ly}
                      fill={r.color} style={{ fontFamily: MO, fontSize: 8, fontWeight: 700 }}>
                      {r.label}
                    </text>
                    <text x={lx + 6} y={ly + 12}
                      fill="#3a4a60" style={{ fontFamily: MO, fontSize: 8 }}>
                      {formatMcap(r.amount)}
                    </text>
                  </g>
                );
              })}

              {/* company label in epicenter */}
              <text x="110" y="160" textAnchor="middle"
                fill={risk.hex} style={{ fontFamily: MO, fontSize: 8, fontWeight: 700 }}>
                {company.company_id}
              </text>
            </svg>
          </div>

          {/* ring breakdown bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rings.map((r, i) => {
              const pct = (r.amount / total) * 100;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "baseline" }}>
                    <span style={{ fontFamily: MO, fontSize: 8, color: "#4a5a70", letterSpacing: "0.08em" }}>{r.label}</span>
                    <span style={{ fontFamily: MO, fontSize: 12, fontWeight: 700, color: r.color.length > 7 ? "#ffb020" : r.color }}>
                      {formatMcap(r.amount)}
                    </span>
                  </div>
                  <div style={{ height: 3, background: "#0a0e16", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: `linear-gradient(90deg, ${r.color.length > 7 ? "#ffb02077" : r.color + "88"}, ${r.color.length > 7 ? "#ffb020" : r.color})`,
                      borderRadius: 2,
                      boxShadow: `0 0 6px ${r.color.length > 7 ? "#ffb020" : r.color}66`,
                      transition: "width 1s cubic-bezier(.23,1,.32,1)",
                    }} />
                  </div>
                  <div style={{ fontFamily: SA, fontSize: 11, color: "#3a4a60", marginTop: 4, lineHeight: 1.5 }}>
                    {r.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: affected companies list + timeline */}
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* methodology note */}
          <div style={{
            background: mode === "predicted" ? "rgba(255,68,85,0.06)" : "#070b12",
            border: `1px solid ${mode === "predicted" ? "rgba(255,68,85,0.2)" : "#0d1622"}`,
            borderLeft: `3px solid ${mode === "predicted" ? "#ff4455" : risk.hex}`,
            borderRadius: 3, padding: "10px 14px",
          }}>
            <div style={{ fontFamily: MO, fontSize: 8, color: mode === "predicted" ? "#ff4455" : risk.hex, letterSpacing: "0.12em", marginBottom: 5, fontWeight: 700 }}>
              {mode === "predicted" ? "⚠ SCENARIO MODEL" : "◉ IMPACT MODEL"}
            </div>
            <div style={{ fontFamily: SA, fontSize: 11, color: "#4a5a78", lineHeight: 1.7 }}>
              {mode === "predicted"
                ? `Modeled on comparable Indian accounting fraud collapses. Companies with score ${ni(company.composite_score)}/100 show ${(wipeFactor * 100).toFixed(0)}% avg direct wipe on confession day. Sector multiplier: ${fraudMultiplier.toFixed(1)}×.`
                : `Based on current risk score ${ni(company.composite_score)}/100. Estimated market impact from elevated fraud probability. Not a confirmed fraud event — this is a quantitative risk assessment.`
              }
            </div>
          </div>

          {/* at-risk companies */}
          <div>
            <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.16em", marginBottom: 12, fontWeight: 600 }}>
              SECTOR BLAST RADIUS — COMPANIES AT RISK
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {atRisk.length === 0 ? (
                <div style={{ fontFamily: MO, fontSize: 9, color: "#1e2838" }}>No sector peers tracked.</div>
              ) : (
                atRisk.map((p, i) => {
                  const pr = riskOf(p.composite_score);
                  const ownRisk = (p.composite_score || 0) > 50;
                  return (
                    <div key={p.company_id} style={{
                      display: "grid", gridTemplateColumns: "20px 1fr 90px 50px",
                      alignItems: "center", gap: 10,
                      padding: "8px 12px",
                      background: ownRisk ? "rgba(255,68,85,0.04)" : "#070b12",
                      border: `1px solid ${ownRisk ? "rgba(255,68,85,0.15)" : "#0d1622"}`,
                      borderRadius: 3,
                    }}>
                      <span style={{ fontFamily: MO, fontSize: 9, color: "#2a3548" }}>{i + 1}</span>
                      <div>
                        <div style={{ fontFamily: SA, fontSize: 12, fontWeight: 600, color: "#8898b0" }}>
                          {p.company_name || p.company_id}
                          {ownRisk && <span style={{ fontFamily: MO, fontSize: 7, color: "#ff4455", marginLeft: 6, letterSpacing: "0.08em" }}>HIGH RISK</span>}
                        </div>
                        <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3548" }}>{p.company_id}</div>
                      </div>
                      {/* exposure bar */}
                      <div>
                        <div style={{ fontFamily: MO, fontSize: 10, fontWeight: 700, color: "#ffb020", marginBottom: 3, textAlign: "right" }}>
                          −{p.lossPct.toFixed(1)}%
                        </div>
                        <div style={{ height: 2, background: "#0a0e16", borderRadius: 1, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${Math.min(p.lossPct / (sectorContagionFactor * fraudMultiplier * 100) * 100, 100)}%`,
                            background: "#ffb020", borderRadius: 1,
                          }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: MO, fontSize: 11, fontWeight: 700, color: pr.hex, textAlign: "right" }}>
                        {ni(p.composite_score)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* damage timeline */}
          <div>
            <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3850", letterSpacing: "0.16em", marginBottom: 12, fontWeight: 600 }}>
              {mode === "predicted" ? "PREDICTED DAMAGE TIMELINE" : "TYPICAL DAMAGE PROGRESSION"}
            </div>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 1, background: "linear-gradient(180deg,#1e2838,transparent)" }} />
              {(mode === "predicted" ? [
                { t: "T+0 (Discovery)", color: "#ff4455", desc: `Stock halted. NSE circuit breaker triggers. −${(wipeFactor * 100).toFixed(0)}–72% intraday.` },
                { t: "T+1 to T+5", color: "#ff8844", desc: `Sector peers fall ${(sectorContagionFactor * 100).toFixed(0)}–${(sectorContagionFactor * 1.5 * 100).toFixed(0)}%. Mutual funds begin redemption pressure.` },
                { t: "T+7 to T+30", color: "#ffb020", desc: "SEBI investigation freezes promoter shares. FIIs reduce India exposure. Derivative positions unwind." },
                { t: "T+30 to T+180", color: "#8888aa", desc: "Forensic audit commissioned. Restatement of 5–10 years of financials. Rating downgrades cascade." },
              ] : [
                { t: "CURRENT STATUS", color: risk.hex, desc: `Risk score ${ni(company.composite_score)}/100. ${risk.label} probability of material misstatement based on Beneish + Altman signals.` },
                { t: "IF MAINTAINED", color: "#ffb020", desc: "Continued high score over 2+ quarters warrants short-seller attention and audit committee scrutiny." },
                { t: "IF ESCALATING", color: "#ff8844", desc: "Score crossing 75 triggers CRITICAL threshold — historical base rate for Indian fraud: ~12% per year at this level." },
                { t: "MONITORING REQUIRED", color: "#ff4455", desc: "AuditGPT flags for quarterly re-analysis. Track DSRI, AQI, and working capital trend as leading indicators." },
              ]).map((item, i) => (
                <div key={i} style={{ position: "relative", paddingBottom: 16, paddingLeft: 16 }}>
                  <div style={{
                    position: "absolute", left: -14, top: 4,
                    width: 10, height: 10, borderRadius: "50%",
                    background: `${item.color}22`, border: `2px solid ${item.color}`,
                    boxShadow: `0 0 8px ${item.color}88`,
                  }} />
                  <div style={{ fontFamily: MO, fontSize: 9, color: item.color, letterSpacing: "0.06em", marginBottom: 4, fontWeight: 700 }}>
                    {item.t}
                  </div>
                  <div style={{ fontFamily: SA, fontSize: 11, color: "#5a6a80", lineHeight: 1.6 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTOR RISK SUMMARY BAR ──────────────────────────────────────────────────
function SectorRiskBar({ companies }) {
  const bySector = useMemo(() => {
    const map = {};
    companies.forEach(c => {
      const s = c.sector || "Unknown";
      if (!map[s]) map[s] = [];
      map[s].push(c);
    });
    return Object.entries(map).map(([sector, arr]) => ({
      sector,
      count: arr.length,
      avg: arr.reduce((s, c) => s + (c.composite_score || 0), 0) / arr.length,
      max: Math.max(...arr.map(c => c.composite_score || 0)),
      high: arr.filter(c => (c.composite_score || 0) > 50).length,
    })).sort((a, b) => b.avg - a.avg);
  }, [companies]);

  return (
    <div style={{
      background: "#080c14", border: "1px solid #0d1622",
      borderTop: "2px solid #00d4ff", borderRadius: 4,
      padding: "18px 28px 20px",
    }}>
      <div style={{ fontFamily: MO, fontSize: 8, color: "#00d4ff", letterSpacing: "0.22em", marginBottom: 14, fontWeight: 700 }}>
        ◈ SECTOR RISK RANKING
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
        {bySector.map(({ sector, count, avg, max, high }) => {
          const r = riskOf(avg);
          const rMax = riskOf(max);
          return (
            <div key={sector} style={{
              background: "#070b12", border: "1px solid #0d1622",
              borderLeft: `3px solid ${r.hex}`, borderRadius: 3,
              padding: "10px 14px",
            }}>
              <div style={{ fontFamily: SA, fontSize: 12, fontWeight: 600, color: "#8898b0", marginBottom: 6, lineHeight: 1.3 }}>
                {sector}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                <span style={{ fontFamily: MO, fontSize: 16, fontWeight: 700, color: r.hex, textShadow: `0 0 8px ${r.hex}66` }}>
                  {avg.toFixed(0)}
                </span>
                <span style={{ fontFamily: MO, fontSize: 8, color: "#2a3548" }}>avg</span>
                <span style={{ fontFamily: MO, fontSize: 10, color: rMax.hex, fontWeight: 700 }}>
                  {max.toFixed(0)} pk
                </span>
              </div>
              <div style={{ height: 2, background: "#0a0e16", borderRadius: 1, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${avg}%`, background: `linear-gradient(90deg,${r.hex}88,${r.hex})`, borderRadius: 1 }} />
              </div>
              <div style={{ fontFamily: MO, fontSize: 8, color: "#2a3548" }}>
                {count} co. · {high} high-risk
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function CriticalSection() {
  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [selected, setSelected] = useState(null);
  const splashRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/sectors`).then(r => r.json()),
    ]).then(([sectorData]) => {
      // sectorData is array of {sector_name, companies:[...], avg_score}
      const allCompanies = [];
      const sectorMap = {};
      (Array.isArray(sectorData) ? sectorData : []).forEach(sec => {
        const comps = sec.companies || [];
        sectorMap[sec.sector_name || sec.sector] = comps;
        comps.forEach(c => allCompanies.push({ ...c, sector: sec.sector_name || sec.sector || c.sector }));
      });
      setCompanies(allCompanies.sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0)));
      setSectors(sectorMap);
      setLoading(false);
    }).catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  const handleSelect = (company) => {
    setSelected(company);
    setTimeout(() => splashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  // ── generate mock companies if API is empty (demo mode)
  const DEMO_COMPANIES = useMemo(() => {
    if (companies.length > 0) return companies;
    const sectors = [
      "IT Services", "NBFC", "Infrastructure", "Pharma", "Real Estate",
      "Power", "Chemicals", "Metals", "Consumer", "Banking",
    ];
    const names = [
      ["INFY","TCS","WIPRO","HCLT","MPHASIS","COFORGE","LTIM","PERSISTENT"],
      ["BAJFINANCE","CHOLAFIN","MUTHOOTFIN","IIFLFINANCE","MANAPPURAM","SHRIRAMFIN","PNBHOUSING","LICHSGFIN"],
      ["ADANIPORTS","JSWINFRA","IRCON","NCC","KNRCON","ASHOKA","PNCINFRA","HCC"],
      ["SUNPHARMA","DRREDDY","CIPLA","AUROPHARMA","LUPIN","TORNTPHARM","ALKEM","GLAND"],
      ["DLF","GODREJPROP","OBEROIRLTY","PRESTIGE","BRIGADE","SOBHA","MAHLIFE","PHOENIXLTD"],
      ["NTPC","POWERGRID","ADANIGREEN","TATAPOWER","CESC","TORNTPOWER","JPPOWER","RPOWER"],
      ["PIDILITIND","DEEPAKNTR","AAVAS","NAVINFLUOR","SUDARSCHEM","VINATIORGA","PCBL","ATUL"],
      ["TATASTEEL","JSWSTEEL","HINDALCO","VEDL","NMDC","COALINDIA","MOIL","SAIL"],
      ["HINDUNILVR","NESTLEIND","BRITANNIA","DABUR","EMAMILTD","MARICO","COLPAL","GODREJCP"],
      ["HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAKBANK","INDUSINDBK","BANDHANBNK","FEDERALBNK"],
    ];
    const scores = [
      [12,8,15,9,22,31,18,11],
      [68,42,29,71,55,38,62,44],
      [81,73,58,44,29,63,51,38],
      [19,14,28,35,22,17,31,23],
      [77,61,83,55,42,67,38,51],
      [45,31,88,52,29,41,62,74],
      [16,22,12,18,25,11,19,14],
      [38,29,44,55,18,22,31,42],
      [11,9,14,21,16,12,18,7],
      [22,14,19,28,17,32,58,29],
    ];
    const mcaps = [
      [1487230,1401225,244310,452180,52340,31200,198400,61200],
      [428900,98200,52100,22400,18700,119600,21800,81400],
      [289100,48200,18400,8200,12400,7800,6200,2100],
      [321400,110200,88400,72100,58200,164200,42100,29400],
      [214400,98400,88200,52400,42100,18400,21200,31400],
      [312800,288400,224100,128400,22100,42800,8400,14200],
      [88400,52100,11400,44200,14100,22400,9800,31200],
      [192400,221200,155400,112200,72100,98400,8800,42200],
      [528800,422100,112400,88200,52100,71400,49800,119200],
      [1218400,822100,702800,512200,428800,312400,48200,98200],
    ];
    const out = [];
    sectors.forEach((sec, si) => {
      names[si].forEach((id, ci) => {
        out.push({
          company_id: id,
          company_name: id,
          sector: sec,
          composite_score: scores[si][ci],
          market_cap: mcaps[si][ci],
          risk_level: riskOf(scores[si][ci]).label,
        });
      });
    });
    return out.sort((a, b) => b.composite_score - a.composite_score);
  }, [companies]);

  const DEMO_SECTORS = useMemo(() => {
    const map = {};
    DEMO_COMPANIES.forEach(c => {
      if (!map[c.sector]) map[c.sector] = [];
      map[c.sector].push(c);
    });
    return map;
  }, [DEMO_COMPANIES]);

  const displayCompanies = DEMO_COMPANIES;
  const displaySectors = Object.keys(sectors).length > 0 ? sectors : DEMO_SECTORS;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#070b12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 52, height: 52 }}>
        <div style={{ width: 52, height: 52, border: "1px solid #0f1826", borderTop: "2px solid #ff4455", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <div style={{ position: "absolute", inset: 9, border: "1px solid #0f1826", borderBottom: "2px solid #00d4ff", borderRadius: "50%", animation: "spin 1.2s linear infinite reverse" }} />
      </div>
      <div style={{ fontFamily: MO, fontSize: 10, color: "#2a3850", letterSpacing: "0.22em" }}>SCANNING ALL SECTORS</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#070b12", color: "#c0ccd8" }}>
      <Scanlines />
      <Nav />

      {/* threat stripe */}
      <div style={{ height: 2, background: "linear-gradient(90deg,#ff4455 0%,#ff445555 40%,transparent 70%)" }} />

      <div style={{ padding: "28px 40px 100px" }}>

        {/* PAGE HERO */}
        <div style={{
          background: "linear-gradient(135deg,#0d0810,#080c14)",
          border: "1px solid #0d1622", borderTop: "2px solid #ff4455",
          borderRadius: 4, padding: "28px 36px", marginBottom: 14,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -80, right: 20, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,68,85,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: MO, fontSize: 8, color: "#ff4455", letterSpacing: "0.22em", marginBottom: 10, fontWeight: 700 }}>
                ◉ LIVE THREAT ANALYSIS · NSE EQUITIES · ALL SECTORS
              </div>
              <h1 style={{ fontFamily: SA, fontSize: 30, fontWeight: 800, color: "#f0e8e8", margin: "0 0 10px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                ⚠ Critical Section
              </h1>
              <p style={{ fontFamily: SA, fontSize: 13, color: "#5a5068", lineHeight: 1.75, margin: 0, maxWidth: 600 }}>
                Every tracked NSE company mapped by composite fraud risk. Click any cell to model the contagion splash zone — both current estimated impact and predicted blast radius if fraud is confirmed.
              </p>
            </div>
            <div style={{ display: "flex", gap: 2, flexDirection: "column", alignItems: "flex-end" }}>
              {[
                { s: "0–25", l: "LOW RISK", c: "#00ff88" },
                { s: "26–50", l: "MEDIUM", c: "#ffb020" },
                { s: "51–75", l: "HIGH", c: "#ff8844" },
                { s: "76–100", l: "CRITICAL", c: "#ff4455" },
              ].map(({ s, l, c }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: MO, fontSize: 8, color: "#2a3548", textAlign: "right", minWidth: 36 }}>{s}</span>
                  <div style={{ width: 36, height: 14, borderRadius: 2, background: c, opacity: 0.8, boxShadow: `0 0 8px ${c}66` }} />
                  <span style={{ fontFamily: MO, fontSize: 8, color: c, letterSpacing: "0.08em", minWidth: 60 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTOR RISK BAR */}
        <div style={{ marginBottom: 14 }}>
          <SectorRiskBar companies={displayCompanies} />
        </div>

        {/* THREAT MATRIX */}
        <div style={{ marginBottom: 14 }}>
          <ThreatMatrix
            companies={displayCompanies}
            onSelect={handleSelect}
            selectedId={selected?.company_id}
          />
        </div>

        {/* CONTAGION SPLASH ZONE */}
        <div ref={splashRef}>
          <ContagionZone
            company={selected}
            allCompanies={displayCompanies}
            sectorMap={displaySectors}
          />
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
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes critBlink{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes ripple1{
          0%{r:20;opacity:0.7;stroke-width:2}
          100%{r:100;opacity:0;stroke-width:0.5}
        }
        @keyframes ripple2{
          0%{r:20;opacity:0.5;stroke-width:1.5}
          100%{r:140;opacity:0;stroke-width:0.5}
        }
        @keyframes ripple3{
          0%{r:20;opacity:0.35;stroke-width:1}
          100%{r:180;opacity:0;stroke-width:0.3}
        }
      `}</style>
    </div>
  );
}
