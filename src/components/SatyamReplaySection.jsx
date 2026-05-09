import { useState, useEffect, useRef } from "react";

// ─── YEAR-BY-YEAR CASE DATA ───────────────────────────────────────────────────
const YEARS = [
  {
    year: 2000, phase: "BASELINE", phaseColor: "#00ff88",
    headline: "Legitimate Growth — Y2K Era",
    body: "Satyam operates as a genuine mid-tier IT services firm, riding India's Y2K outsourcing wave. All financial statements are accurate. Auditor PricewaterhouseCoopers issues an unqualified opinion for the first of what will be nine consecutive years.",
    events: [
      "Revenue ₹1,461 Cr — entirely authentic, zero fabrication",
      "NYSE-listed via ADR — investor confidence is high",
      "Beneish M-Score: −2.91 — deep in the safe zone",
      "PwC signs unqualified audit opinion: Year 1 of 9",
    ],
    metrics: { dsri: 0.97, sgi: 1.22, gmi: 0.98, aqi: 1.01, tata: 0.027 },
    mscore: -2.91, fakeCash: 0, isCollapse: false,
  },
  {
    year: 2001, phase: "MANIPULATION BEGINS", phaseColor: "#ffb020",
    headline: "Small Entries — The Snowball Starts",
    body: "Raju later confessed that manipulation began modestly — small fictitious cash entries added to plug profit shortfalls. The gap between real and reported accounts is still narrow, but the mechanism is now running and will compound every quarter.",
    events: [
      "Fictitious cash entries begin — estimated ₹200 Cr added",
      "DSRI rises to 1.04 — receivables inflating relative to sales",
      "TATA (accruals ratio) ticks up to 0.041 — early signal",
      "M-Score −2.61 — still below threshold, auditors unconcerned",
    ],
    metrics: { dsri: 1.04, sgi: 1.31, gmi: 1.03, aqi: 1.08, tata: 0.041 },
    mscore: -2.61, fakeCash: 200, isCollapse: false,
  },
  {
    year: 2002, phase: "ACCELERATION", phaseColor: "#ffb020",
    headline: "The Gap Widens",
    body: "Real revenue growth slows as IT spending contracts post-dot-com crash. Raju inflates invoices to maintain Wall Street growth expectations. DSRI crosses 1.1 — receivables are outpacing revenue for the second consecutive year.",
    events: [
      "Fictitious invoices issued to inflate revenue line",
      "DSRI: 1.11 — receivables growing materially faster than sales",
      "Estimated undisclosed liabilities: ~₹500 Cr",
      "M-Score −2.34 — model beginning to detect anomaly pattern",
    ],
    metrics: { dsri: 1.11, sgi: 1.19, gmi: 1.06, aqi: 1.12, tata: 0.052 },
    mscore: -2.34, fakeCash: 500, isCollapse: false,
  },
  {
    year: 2003, phase: "DEEPENING FRAUD", phaseColor: "#ffb020",
    headline: "Fabricated Bank Statements",
    body: "Pressure from institutional investors forces Raju to sustain double-digit growth optics. Fabricated bank statements are now presented directly to auditors during the annual audit process. The accounts gap crosses ₹1,000 Cr.",
    events: [
      "Fabricated bank confirmation letters sent to PwC",
      "DSRI: 1.23 — receivables are now significantly inflated",
      "Fake cash on the books: ~₹1,000 Cr",
      "M-Score −2.12 — approaching the manipulator zone",
    ],
    metrics: { dsri: 1.23, sgi: 1.28, gmi: 1.08, aqi: 1.18, tata: 0.064 },
    mscore: -2.12, fakeCash: 1000, isCollapse: false,
  },
  {
    year: 2004, phase: "THRESHOLD BREACHED", phaseColor: "#ff4455",
    headline: "Beneish Model Flags Manipulation",
    body: "The M-Score crosses −1.78. Any quantitative analyst running the Beneish model at this point would have flagged Satyam for probable earnings manipulation. Not a single analyst did. DSRI at 1.38 means receivables are growing 38% faster than revenue — a textbook fraud signal missed by every gatekeeper.",
    events: [
      "⚠ M-Score −1.72 — above the −1.78 manipulation threshold",
      "DSRI: 1.38 — receivables growing 38% faster than revenue",
      "Fake cash embedded in balance sheet: ~₹1,800 Cr",
      "PwC issues unqualified opinion — 5th consecutive year",
    ],
    metrics: { dsri: 1.38, sgi: 1.35, gmi: 1.14, aqi: 1.24, tata: 0.078 },
    mscore: -1.72, fakeCash: 1800, isCollapse: false,
  },
  {
    year: 2005, phase: "DEEP IN FRAUD", phaseColor: "#ff4455",
    headline: "Riding a Tiger",
    body: "Raju later described this period as 'riding a tiger, not knowing how to get off.' Every quarter now requires additional fabrication to sustain the previous quarter's fiction. The fraud has become self-sustaining and is accelerating at ~₹700 Cr per year.",
    events: [
      "~35% of reported revenue is now entirely fabricated",
      "DSRI: 1.52 — receivables ratio at extreme elevated levels",
      "Fake cash growing ~₹700 Cr per year — now ₹2,500 Cr",
      "M-Score −1.48 — deep in the manipulation zone",
    ],
    metrics: { dsri: 1.52, sgi: 1.41, gmi: 1.19, aqi: 1.31, tata: 0.091 },
    mscore: -1.48, fakeCash: 2500, isCollapse: false,
  },
  {
    year: 2006, phase: "PEAK DECEPTION", phaseColor: "#ff4455",
    headline: "₹3,200 Cr Hidden in Plain Sight",
    body: "Satyam is now India's 4th largest IT company by reported revenue. The fraud is entirely invisible to markets, analysts, and auditors. Stock is near an all-time high. In a moment of supreme irony, Raju accepts the Golden Peacock Award for Corporate Governance.",
    events: [
      "Raju wins the Golden Peacock Award for Corporate Governance",
      "₹3,200 Cr embedded across 7,561 fictitious bank accounts",
      "DSRI: 1.71 — the highest ever recorded for this company",
      "M-Score −1.21 — well past the point of no return",
    ],
    metrics: { dsri: 1.71, sgi: 1.38, gmi: 1.22, aqi: 1.38, tata: 0.104 },
    mscore: -1.21, fakeCash: 3200, isCollapse: false,
  },
  {
    year: 2007, phase: "FIRST CRACKS", phaseColor: "#ff4455",
    headline: "World Bank Strikes",
    body: "The World Bank bars Satyam from all its projects for 8 years, citing data theft and bribery. Raju dismisses it publicly as a misunderstanding. Internally, the panic begins. The fabricated hole in the balance sheet is now ₹4,200 Cr — wider than ever.",
    events: [
      "World Bank bars Satyam from all projects for 8 years",
      "Fake cash: ₹4,200 Cr — 72% of reported cash is fictitious",
      "DSRI: 1.89 — receivables ratio in crisis territory",
      "M-Score −0.94 — the model is now certain of manipulation",
    ],
    metrics: { dsri: 1.89, sgi: 1.44, gmi: 1.27, aqi: 1.45, tata: 0.118 },
    mscore: -0.94, fakeCash: 4200, isCollapse: false,
  },
  {
    year: 2008, phase: "COLLAPSE IMMINENT", phaseColor: "#ff4455",
    headline: "The Maytas Gambit Fails",
    body: "In a desperate attempt to cover the fraud, Raju tries to use Satyam's fictitious cash to acquire Maytas Infrastructure (his family firm) — effectively replacing fabricated assets with real ones. Institutional investors revolt. The stock crashes 55% in a single session. The cover-up is over.",
    events: [
      "Maytas acquisition announced — stock crashes 55% in one session",
      "Reported cash: ₹5,361 Cr — fake portion: ₹5,040 Cr (94%)",
      "DSRI: 2.13 — the receivables metric is at catastrophic levels",
      "M-Score −0.61 — Beneish model: certainty of manipulation",
    ],
    metrics: { dsri: 2.13, sgi: 1.31, gmi: 1.33, aqi: 1.52, tata: 0.134 },
    mscore: -0.61, fakeCash: 5040, isCollapse: false,
  },
  {
    year: 2009, phase: "CONFESSION", phaseColor: "#ff4455",
    headline: "January 7 — Raju Confesses",
    body: "Ramalinga Raju sends a confession letter to the board: ₹5,040 Cr in fictitious cash. ₹490 Cr in non-existent accrued interest. India's largest corporate fraud at the time. The Beneish model had flagged probable manipulation 5 years earlier in 2004. Not a single auditor, analyst, or regulator acted on it.",
    events: [
      "Jan 7: Confession letter sent to SEBI, BSE, and NSE",
      "₹5,040 Cr in fake cash — 94% of all reported cash was fiction",
      "Share price collapses: ₹186 → ₹11 within 24 hours",
      "AuditGPT M-Score breach: 2004 — 5 full years before collapse",
    ],
    metrics: { dsri: 2.13, sgi: 1.31, gmi: 1.33, aqi: 1.52, tata: 0.134 },
    mscore: null, fakeCash: 5040, isCollapse: true,
  },
];

const THRESHOLDS = {
  dsri: 1.031, sgi: 1.134, gmi: 1.054, aqi: 1.254, tata: 0.0631,
};
const METRIC_INFO = {
  dsri: { label: "DSRI",  full: "Days Sales Receivable Index" },
  sgi:  { label: "SGI",   full: "Sales Growth Index" },
  gmi:  { label: "GMI",   full: "Gross Margin Index" },
  aqi:  { label: "AQI",   full: "Asset Quality Index" },
  tata: { label: "TATA",  full: "Total Accruals / Total Assets" },
};
const MO = "'JetBrains Mono', monospace";
const SA = "'Space Grotesk', sans-serif";

// ─── ANIMATED NUMBER HOOK ─────────────────────────────────────────────────────
function useCountTo(target, decimals) {
  const [val, setVal] = useState(target);
  const raf = useRef();
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    const to = target;
    if (Math.abs(from - to) < 0.0001) return;
    const dur = 700;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * ease);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else { prev.current = to; setVal(to); }
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return typeof val === "number" ? val.toFixed(decimals) : "—";
}

// ─── METRIC TILE ──────────────────────────────────────────────────────────────
function MetricTile({ metricKey, value }) {
  const info = METRIC_INFO[metricKey];
  const thresh = THRESHOLDS[metricKey];
  const flagged = value > thresh;
  const col = flagged ? "#ff4455" : "#00ff88";
  const decimals = metricKey === "tata" ? 3 : 2;
  const displayed = useCountTo(value, decimals);

  return (
    <div style={{
      background: flagged ? "rgba(255,68,85,0.04)" : "#04070e",
      border: `1px solid ${flagged ? "#ff445533" : "#151e2a"}`,
      borderTop: `2px solid ${col}`,
      borderRadius: 4,
      padding: "16px 18px",
      transition: "background 0.5s ease, border-color 0.5s ease",
    }}>
      <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.16em", marginBottom: 10, fontWeight: 600 }}>
        {info.label}
      </div>
      <div style={{
        fontFamily: MO, fontSize: 30, fontWeight: 700, color: col, lineHeight: 1,
        textShadow: flagged ? `0 0 18px ${col}55` : "none",
        transition: "color 0.4s ease, text-shadow 0.4s ease",
      }}>
        {displayed}
      </div>
      <div style={{ fontFamily: MO, fontSize: 9, color: "#2e3d50", marginTop: 8, marginBottom: 10 }}>
        threshold {thresh}
      </div>
      <div style={{
        display: "inline-block", fontFamily: MO, fontSize: 9, fontWeight: 700,
        padding: "3px 9px", borderRadius: 3, letterSpacing: "0.12em",
        background: `${col}14`, border: `1px solid ${col}44`, color: col,
      }}>
        {flagged ? "▲ FLAGGED" : "✓ NORMAL"}
      </div>
      <div style={{ fontFamily: SA, fontSize: 10, color: "#3a4a60", marginTop: 10, lineHeight: 1.4 }}>
        {info.full}
      </div>
    </div>
  );
}

// ─── M-SCORE TRAJECTORY SVG ───────────────────────────────────────────────────
function MScoreTrack({ currentIdx }) {
  const scores = YEARS.map(y => y.mscore);
  const VW = 620, VH = 90;
  const PX = 28, PY = 8, CW = VW - PX * 2, CH = 60;
  const Y_MIN = -3.2, Y_MAX = -0.4, THRESH = -1.78;

  const xOf = i => PX + (i / 9) * CW;
  const yOf = s => s === null ? null : PY + ((Y_MAX - s) / (Y_MAX - Y_MIN)) * CH;
  const yThresh = yOf(THRESH);

  // Build polyline path through valid scores
  let pathD = "";
  scores.forEach((s, i) => {
    if (s === null) return;
    pathD += `${pathD ? " L" : "M"} ${xOf(i).toFixed(1)} ${yOf(s).toFixed(1)}`;
  });

  // Coloured segments — split at threshold
  const dotColor = (s) => {
    if (s === null) return "#ff4455";
    if (s > THRESH) return "#ff4455";
    if (s > -2.2) return "#ffb020";
    return "#00ff88";
  };

  return (
    <div>
      <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.18em", marginBottom: 10, fontWeight: 600 }}>
        M-SCORE TRAJECTORY · 2000 – 2009 · THRESHOLD −1.78
      </div>
      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {[-3.0, -2.5, -2.0, -1.78, -1.5, -1.0].map(v => {
          const y = yOf(v);
          const isThresh = v === -1.78;
          return (
            <g key={v}>
              <line x1={PX} y1={y} x2={PX + CW} y2={y}
                stroke={isThresh ? "#ff445555" : "#0d1520"}
                strokeWidth={isThresh ? 1 : 0.5}
                strokeDasharray={isThresh ? "4 4" : "none"} />
              <text x={PX - 5} y={y + 3.5} textAnchor="end" fill={isThresh ? "#ff4455" : "#2a3848"}
                style={{ fontFamily: MO, fontSize: 7.5, fontWeight: isThresh ? 700 : 400 }}>
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Threshold label */}
        <text x={PX + CW + 4} y={yThresh + 4} fill="#ff4455"
          style={{ fontFamily: MO, fontSize: 8, fontWeight: 700 }}>
          ← THRESHOLD
        </text>

        {/* Shaded danger zone above threshold */}
        <rect x={PX} y={PY} width={CW} height={yThresh - PY}
          fill="rgba(255,68,85,0.04)" />

        {/* Score path */}
        <path d={pathD} fill="none" stroke="#1a2a40" strokeWidth="1.5" />

        {/* Colored segment overlays */}
        {scores.map((s, i) => {
          if (i === 0 || s === null || scores[i - 1] === null) return null;
          const x1 = xOf(i - 1), y1 = yOf(scores[i - 1]);
          const x2 = xOf(i), y2 = yOf(s);
          const col = s > THRESH ? "#ff445588" : s > -2.2 ? "#ffb02088" : "#00ff8888";
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="2" strokeLinecap="round" />;
        })}

        {/* Year dots */}
        {scores.map((s, i) => {
          const x = xOf(i);
          const y = yOf(s === null ? scores[i - 1] ?? -0.61 : s);
          const isActive = i === currentIdx;
          const col = dotColor(s);
          return (
            <g key={i}>
              {isActive && (
                <circle cx={x} cy={y} r={10} fill={`${col}18`} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
              )}
              <circle cx={x} cy={y} r={isActive ? 5.5 : 3}
                fill={isActive ? col : `${col}88`}
                style={isActive ? { filter: `drop-shadow(0 0 6px ${col})` } : {}}
                stroke={isActive ? "#070b12" : "none"}
                strokeWidth="1.5"
              />
              {/* Collapse marker */}
              {YEARS[i].isCollapse && (
                <text x={x} y={y - 10} textAnchor="middle" fill="#ff4455"
                  style={{ fontFamily: MO, fontSize: 9, fontWeight: 700 }}>✕</text>
              )}
            </g>
          );
        })}

        {/* Year labels at bottom */}
        {YEARS.map((yr, i) => (
          <text key={i} x={xOf(i)} y={VH - 2} textAnchor="middle"
            fill={i === currentIdx ? dotColor(yr.mscore) : "#2a3848"}
            style={{ fontFamily: MO, fontSize: 8, fontWeight: i === currentIdx ? 700 : 400 }}>
            {yr.year}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── TIMELINE NODES ───────────────────────────────────────────────────────────
function TimelineNodes({ currentIdx, onSelect }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      {YEARS.map((yr, i) => {
        const isActive = i === currentIdx;
        const isPast = i <= currentIdx;
        const col = yr.isCollapse ? "#ff4455"
          : yr.mscore !== null && yr.mscore > -1.78 ? "#ff4455"
          : yr.mscore !== null && yr.mscore > -2.2 ? "#ffb020"
          : "#00ff88";
        const nextCol = i < YEARS.length - 1
          ? (YEARS[i + 1].mscore !== null && YEARS[i + 1].mscore > -1.78 ? "#ff4455"
            : YEARS[i + 1].mscore !== null && YEARS[i + 1].mscore > -2.2 ? "#ffb020"
            : "#00ff88")
          : col;

        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < YEARS.length - 1 ? 1 : "none" }}>
            <button
              onClick={() => onSelect(i)}
              title={`${yr.year}: ${yr.phase}`}
              style={{
                all: "unset", cursor: "pointer", flexShrink: 0,
                width: isActive ? 18 : 11, height: isActive ? 18 : 11,
                borderRadius: "50%",
                background: isPast ? col : "#1a2535",
                border: `2px solid ${isPast ? col : "#1a2535"}`,
                boxShadow: isActive ? `0 0 14px ${col}99` : "none",
                transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
              }}
            />
            {i < YEARS.length - 1 && (
              <div style={{
                flex: 1, height: 2, borderRadius: 1,
                background: i < currentIdx
                  ? `linear-gradient(90deg, ${col}, ${nextCol})`
                  : "#1a2535",
                transition: "background 0.4s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN SECTION ─────────────────────────────────────────────────────────────
export default function SatyamReplaySection() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2500);
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [flash, setFlash] = useState(false);

  const intervalRef = useRef(null);
  const eventTimers = useRef([]);

  const data = YEARS[idx];
  const isFraud = data.mscore !== null && data.mscore > -1.78;
  const mCol = data.mscore === null ? "#ff4455"
    : data.mscore > -1.78 ? "#ff4455"
    : data.mscore > -2.2 ? "#ffb020"
    : "#00ff88";
  const yearGlow = isFraud || data.isCollapse
    ? `0 0 60px rgba(255,68,85,0.25), 0 0 120px rgba(255,68,85,0.1)`
    : "none";

  // On year change: flash + stagger events
  useEffect(() => {
    eventTimers.current.forEach(clearTimeout);
    eventTimers.current = [];
    setVisibleEvents(0);
    setFlash(true);
    const flashTimer = setTimeout(() => setFlash(false), 300);
    data.events.forEach((_, i) => {
      const t = setTimeout(() => setVisibleEvents(i + 1), 200 + i * 320);
      eventTimers.current.push(t);
    });
    return () => {
      clearTimeout(flashTimer);
      eventTimers.current.forEach(clearTimeout);
    };
  }, [idx]);

  // Playback
  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setIdx(prev => {
        if (prev >= YEARS.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [playing, speed]);

  const go = (i) => { setPlaying(false); setIdx(Math.max(0, Math.min(i, YEARS.length - 1))); };
  const togglePlay = () => {
    if (idx >= YEARS.length - 1) setIdx(0);
    setPlaying(p => !p);
  };

  const fakePct = (data.fakeCash / 5040) * 100;

  // Btn helper
  const Btn = ({ onClick, disabled, children, accent = false }) => {
    const [hov, setHov] = useState(false);
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          all: "unset", cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: MO, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          padding: accent ? "10px 24px" : "8px 16px",
          borderRadius: 3,
          color: disabled ? "#2a3848"
            : accent ? "#070b12"
            : hov ? "#ff4455" : "#8892a4",
          background: disabled ? "transparent"
            : accent ? (hov ? "#cc3344" : "#ff4455")
            : hov ? "rgba(255,68,85,0.08)" : "transparent",
          border: accent ? "none" : `1px solid ${disabled ? "#1a2535" : hov ? "#ff445566" : "#2a3848"}`,
          transition: "all 0.15s ease",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div style={{
      background: `radial-gradient(ellipse at 15% 40%, ${isFraud || data.isCollapse ? "rgba(255,68,85,0.07)" : "rgba(0,255,136,0.03)"} 0%, transparent 55%), #04070e`,
      border: "1px solid #100d16",
      borderTop: "2px solid #ff4455",
      borderRadius: 4,
      marginBottom: 14,
      overflow: "hidden",
      transition: "background 0.8s ease",
    }}>

      {/* ── SECTION HEADER ── */}
      <div style={{
        padding: "22px 32px 18px",
        borderBottom: "1px solid #0f1520",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: MO, fontSize: 9, color: "#ff4455", letterSpacing: "0.22em", marginBottom: 7, fontWeight: 700 }}>
            ◈ CASE STUDY · SATYAM COMPUTER SERVICES · NSE: SATYAMCOMP
          </div>
          <div style={{ fontFamily: SA, fontSize: 20, fontWeight: 800, color: "#e8f0f8", letterSpacing: "-0.02em" }}>
            A Decade of Fabrication <span style={{ color: "#ff4455" }}>2000 – 2009</span>
          </div>
          <div style={{ fontFamily: SA, fontSize: 13, color: "#5a6a80", marginTop: 5, lineHeight: 1.5 }}>
            Reconstructed year-by-year using the Beneish M-Score model · The signal was there 5 years before collapse
          </div>
        </div>
        {/* Phase badge */}
        <div style={{
          fontFamily: MO, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          padding: "8px 16px", borderRadius: 3,
          color: data.phaseColor,
          background: `${data.phaseColor}14`,
          border: `1px solid ${data.phaseColor}44`,
          transition: "all 0.4s ease",
          animation: data.isCollapse ? "critPulse 1.8s ease-in-out infinite" : "none",
        }}>
          {data.phase}
        </div>
      </div>

      {/* ── MAIN CONTENT: YEAR + NARRATIVE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 0 }}>

        {/* LEFT: year, M-Score, fake cash */}
        <div style={{
          padding: "28px 28px 28px 32px",
          borderRight: "1px solid #0f1520",
          display: "flex", flexDirection: "column", gap: 22,
        }}>
          {/* Giant year */}
          <div>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.18em", marginBottom: 8, fontWeight: 600 }}>
              FISCAL YEAR
            </div>
            <div style={{
              fontFamily: MO, fontSize: 88, fontWeight: 700, lineHeight: 0.85,
              color: mCol,
              textShadow: yearGlow,
              letterSpacing: "-3px",
              opacity: flash ? 0.15 : 1,
              transition: "opacity 0.08s ease, color 0.5s ease, text-shadow 0.5s ease",
            }}>
              {data.year}
            </div>
          </div>

          {/* M-Score */}
          <div style={{
            background: "#070b12", border: `1px solid ${mCol}33`,
            borderLeft: `3px solid ${mCol}`, borderRadius: 4, padding: "14px 16px",
          }}>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.14em", marginBottom: 8, fontWeight: 600 }}>
              BENEISH M-SCORE
            </div>
            <div style={{
              fontFamily: MO, fontSize: 38, fontWeight: 700, color: mCol, lineHeight: 1,
              textShadow: `0 0 20px ${mCol}55`,
              transition: "color 0.5s ease",
            }}>
              {data.mscore !== null ? data.mscore.toFixed(2) : "N/A"}
            </div>
            <div style={{
              fontFamily: MO, fontSize: 9, fontWeight: 700, color: mCol,
              letterSpacing: "0.12em", marginTop: 8,
            }}>
              {data.isCollapse ? "◉ FRAUD CONFIRMED"
                : isFraud ? "▲ MANIPULATION LIKELY"
                : "✓ BELOW THRESHOLD"}
            </div>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4060", marginTop: 5 }}>
              threshold: −1.78
            </div>
          </div>

          {/* Fabricated cash */}
          <div>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.14em", marginBottom: 8, fontWeight: 600 }}>
              FABRICATED ENTRIES
            </div>
            {data.fakeCash === 0 ? (
              <div style={{ fontFamily: MO, fontSize: 18, fontWeight: 700, color: "#00ff88" }}>₹0</div>
            ) : (
              <>
                <div style={{
                  fontFamily: MO, fontSize: 26, fontWeight: 700, color: "#ff4455", lineHeight: 1,
                  textShadow: "0 0 16px rgba(255,68,85,0.44)",
                }}>
                  ₹{data.fakeCash.toLocaleString()} Cr
                </div>
                <div style={{ height: 5, background: "#0c1018", borderRadius: 3, marginTop: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${fakePct}%`,
                    background: "linear-gradient(90deg, #ff445588, #ff4455)",
                    borderRadius: 3,
                    boxShadow: "0 0 10px rgba(255,68,85,0.5)",
                    transition: "width 0.9s cubic-bezier(.23,1,.32,1)",
                  }} />
                </div>
                <div style={{ fontFamily: MO, fontSize: 8, color: "#3a4060", marginTop: 5, display: "flex", justifyContent: "space-between" }}>
                  <span>₹0</span>
                  <span style={{ color: "#ff445577" }}>{fakePct.toFixed(0)}% of peak</span>
                  <span>₹5,040 Cr</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: narrative + events */}
        <div style={{ padding: "28px 32px 28px 28px", display: "flex", flexDirection: "column" }}>
          <h2 style={{
            fontFamily: SA, fontSize: 22, fontWeight: 800, color: "#e8f0f8",
            margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.02em",
          }}>
            {data.headline}
          </h2>
          <p style={{
            fontFamily: SA, fontSize: 14, color: "#6a7a8e", lineHeight: 1.85,
            margin: "0 0 22px", fontWeight: 400,
          }}>
            {data.body}
          </p>

          {/* Staggered events */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {data.events.map((ev, i) => (
              <div key={`${idx}-${i}`} style={{
                display: "flex", gap: 14, alignItems: "flex-start",
                opacity: i < visibleEvents ? 1 : 0,
                transform: i < visibleEvents ? "translateX(0)" : "translateX(-16px)",
                transition: "opacity 0.38s ease, transform 0.38s ease",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: `${mCol}14`, border: `1px solid ${mCol}44`,
                  display: "grid", placeItems: "center", marginTop: 1,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: mCol }} />
                </div>
                <span style={{ fontFamily: SA, fontSize: 14, color: "#9aaabb", lineHeight: 1.65, fontWeight: 500 }}>
                  {ev}
                </span>
              </div>
            ))}
          </div>

          {/* Collapse callout */}
          {data.isCollapse && (
            <div style={{
              marginTop: 20, padding: "14px 18px",
              background: "rgba(255,68,85,0.08)", border: "1px solid rgba(255,68,85,0.3)",
              borderLeft: "3px solid #ff4455", borderRadius: 4,
            }}>
              <div style={{ fontFamily: MO, fontSize: 9, color: "#ff4455", letterSpacing: "0.16em", marginBottom: 6, fontWeight: 700 }}>
                ◉ AUDITGPT VERDICT
              </div>
              <div style={{ fontFamily: SA, fontSize: 13, color: "#d0a0a8", lineHeight: 1.7 }}>
                The Beneish M-Score crossed the manipulation threshold in <strong style={{ color: "#ff4455" }}>2004</strong> — five full years before this confession. Every datapoint was available to analysts, auditors, and regulators. None acted.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── METRIC TILES ── */}
      <div style={{
        borderTop: "1px solid #0f1520", padding: "20px 32px",
        background: "#03060c",
      }}>
        <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.18em", marginBottom: 14, fontWeight: 600 }}>
          BENEISH COMPONENTS · YEAR {data.year}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {Object.entries(data.metrics).map(([k, v]) => (
            <MetricTile key={k} metricKey={k} value={v} />
          ))}
        </div>
      </div>

      {/* ── M-SCORE TRAJECTORY ── */}
      <div style={{ borderTop: "1px solid #0f1520", padding: "20px 32px", background: "#04070e" }}>
        <MScoreTrack currentIdx={idx} />
      </div>

      {/* ── TIMELINE + CONTROLS ── */}
      <div style={{
        borderTop: "1px solid #0f1520", padding: "18px 32px 22px",
        background: "#03060c",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* Timeline nodes */}
        <TimelineNodes currentIdx={idx} onSelect={go} />

        {/* Year labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: -10 }}>
          {YEARS.map((yr, i) => (
            <button key={i} onClick={() => go(i)} style={{
              all: "unset", cursor: "pointer",
              fontFamily: MO, fontSize: 9, fontWeight: i === idx ? 700 : 400,
              color: i === idx ? (YEARS[i].mscore !== null && YEARS[i].mscore > -1.78 ? "#ff4455" : "#00ff88") : "#2a3848",
              transition: "color 0.2s ease",
            }}>
              {yr.year}
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingTop: 6, borderTop: "1px solid #0a1018" }}>
          <Btn onClick={() => go(idx - 1)} disabled={idx === 0}>◀ PREV</Btn>

          <button
            onClick={togglePlay}
            style={{
              all: "unset", cursor: "pointer",
              fontFamily: MO, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              padding: "10px 28px", borderRadius: 3,
              background: playing ? "rgba(255,68,85,0.12)" : "#ff4455",
              color: playing ? "#ff4455" : "#070b12",
              border: playing ? "1px solid #ff445566" : "none",
              transition: "all 0.15s ease",
              minWidth: 110, textAlign: "center",
            }}
          >
            {playing ? "⏸ PAUSE"
              : idx >= YEARS.length - 1 ? "↺ REPLAY"
              : "▶ PLAY"}
          </button>

          <Btn onClick={() => go(idx + 1)} disabled={idx === YEARS.length - 1}>NEXT ▶</Btn>

          {/* Progress indicator */}
          <div style={{ fontFamily: MO, fontSize: 10, color: "#3a4a60", marginLeft: 4 }}>
            {idx + 1} / {YEARS.length}
          </div>

          {/* Speed controls */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: MO, fontSize: 9, color: "#2a3848", marginRight: 4 }}>SPEED</span>
            {[[3000, "0.5×"], [2000, "1×"], [1000, "2×"], [500, "4×"]].map(([ms, lbl]) => (
              <button key={ms} onClick={() => setSpeed(ms)} style={{
                all: "unset", cursor: "pointer",
                fontFamily: MO, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                padding: "5px 12px", borderRadius: 3,
                color: speed === ms ? "#ff4455" : "#3a4a60",
                background: speed === ms ? "rgba(255,68,85,0.1)" : "transparent",
                border: `1px solid ${speed === ms ? "rgba(255,68,85,0.35)" : "#1a2535"}`,
                transition: "all 0.1s ease",
              }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes critPulse { 0%,100% { opacity:1; } 50% { opacity:0.55; } }
      `}</style>
    </div>
  );
}

/*
 * ─── HOW TO USE ───────────────────────────────────────────────────────────────
 *
 * 1. Copy this file to frontend/src/components/SatyamReplaySection.jsx
 *
 * 2. In Report.jsx, add the import at the top:
 *    import SatyamReplaySection from "../components/SatyamReplaySection";
 *
 * 3. Add the section into the Report JSX, between the Heatmap/Timeline row
 *    and the Beneish/Altman row:
 *
 *    {/* HEATMAP + TIMELINE *\/}
 *    <div style={{display:"grid", ...}}>...</div>
 *
 *    {/* SATYAM CASE STUDY — always shown *\/}
 *    <SatyamReplaySection />
 *
 *    {/* BENEISH + ALTMAN *\/}
 *    <div style={{display:"grid", ...}}>...</div>
 *
 * 4. Remove the old <ReplayControls> block and the satyamData fetch from
 *    Report.jsx — all that data is now hardcoded inside this component.
 *
 * 5. The FRAUD OVERLAY toggle on the hero (StatChip) can stay — it still
 *    controls the heatmap ghost rows. You'll need to fix the satyamData
 *    fetch separately (move satyam.json to frontend/public/fraud_signatures/).
 * ─────────────────────────────────────────────────────────────────────────────
 */
