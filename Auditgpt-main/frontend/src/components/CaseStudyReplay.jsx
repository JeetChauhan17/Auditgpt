import { useState, useEffect, useRef } from "react";

const MO = "'JetBrains Mono', monospace";
const SA = "'Space Grotesk', sans-serif";

// ─── ANIMATED NUMBER ──────────────────────────────────────────────────────────
function useCountTo(target, decimals) {
  const [val, setVal] = useState(target);
  const raf = useRef();
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current, to = target;
    if (Math.abs(from - to) < 0.0001) return;
    const dur = 700, t0 = performance.now();
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

// ─── METRIC TILE ─────────────────────────────────────────────────────────────
function MetricTile({ metricKey, value, thresholds, metricInfo, accentColor }) {
  const info = metricInfo[metricKey];
  const thresh = thresholds[metricKey];
  // For metrics where LOWER = worse (like z-score components), flagged logic flips
  const flagged = thresh < 0 ? value < thresh : value > thresh;
  const col = flagged ? "#ff4455" : accentColor || "#00ff88";
  const decimals = Math.abs(value) < 1 ? 3 : 2;
  const displayed = useCountTo(value, decimals);

  return (
    <div style={{
      background: flagged ? "rgba(255,68,85,0.04)" : "#04070e",
      border: `1px solid ${flagged ? "#ff445533" : "#151e2a"}`,
      borderTop: `2px solid ${col}`,
      borderRadius: 4, padding: "14px 16px",
      transition: "background 0.5s, border-color 0.5s",
    }}>
      <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.16em", marginBottom: 8, fontWeight: 600 }}>
        {info?.label || metricKey.toUpperCase()}
      </div>
      <div style={{
        fontFamily: MO, fontSize: 26, fontWeight: 700, color: col, lineHeight: 1,
        textShadow: flagged ? `0 0 16px ${col}55` : "none",
        transition: "color 0.4s, text-shadow 0.4s",
      }}>{displayed}</div>
      <div style={{ fontFamily: MO, fontSize: 8, color: "#2e3d50", marginTop: 7, marginBottom: 8 }}>
        threshold {thresh > 0 ? ">" : "<"} {Math.abs(thresh)}
      </div>
      <div style={{
        display: "inline-block", fontFamily: MO, fontSize: 9, fontWeight: 700,
        padding: "3px 9px", borderRadius: 3, letterSpacing: "0.12em",
        background: `${col}14`, border: `1px solid ${col}44`, color: col,
      }}>
        {flagged ? "▲ FLAGGED" : "✓ NORMAL"}
      </div>
      <div style={{ fontFamily: SA, fontSize: 10, color: "#3a4a60", marginTop: 8, lineHeight: 1.4 }}>
        {info?.full || ""}
      </div>
    </div>
  );
}

// ─── SCORE TRAJECTORY SVG ─────────────────────────────────────────────────────
function ScoreTrack({ years, currentIdx, scoreKey, threshold, label, yMin, yMax, dangerAbove = true }) {
  const scores = years.map(y => y[scoreKey]);
  const VW = 620, VH = 95;
  const PX = 30, PY = 8, CW = VW - PX * 2, CH = 62;

  const xOf = i => PX + (i / (years.length - 1)) * CW;
  const yOf = s => s === null ? null : PY + ((yMax - s) / (yMax - yMin)) * CH;
  const yThresh = yOf(threshold);

  let pathD = "";
  scores.forEach((s, i) => {
    if (s === null) return;
    pathD += `${pathD ? " L" : "M"} ${xOf(i).toFixed(1)} ${yOf(s).toFixed(1)}`;
  });

  const dotColor = (s) => {
    if (s === null) return "#ff4455";
    if (dangerAbove ? s > threshold : s < threshold) return "#ff4455";
    const mid = dangerAbove ? threshold - (yMax - yMin) * 0.2 : threshold + (yMax - yMin) * 0.2;
    if (dangerAbove ? s > mid : s < mid) return "#ffb020";
    return "#00ff88";
  };

  const gridLines = dangerAbove
    ? [yMin, yMin + (yMax - yMin) * 0.25, yMin + (yMax - yMin) * 0.5, threshold, yMax].map(v => parseFloat(v.toFixed(2)))
    : [yMax, yMax - (yMax - yMin) * 0.25, threshold, yMin + (yMax - yMin) * 0.25, yMin].map(v => parseFloat(v.toFixed(2)));

  return (
    <div>
      <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.18em", marginBottom: 10, fontWeight: 600 }}>
        {label} · {years[0].year} – {years[years.length - 1].year} · THRESHOLD {threshold}
      </div>
      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: "visible" }}>
        {[...new Set(gridLines)].map(v => {
          const y = yOf(v);
          if (y == null) return null;
          const isT = Math.abs(v - threshold) < 0.001;
          return (
            <g key={v}>
              <line x1={PX} y1={y} x2={PX + CW} y2={y}
                stroke={isT ? "#ff445555" : "#0d1520"}
                strokeWidth={isT ? 1 : 0.5}
                strokeDasharray={isT ? "4 4" : "none"} />
              <text x={PX - 5} y={y + 3.5} textAnchor="end" fill={isT ? "#ff4455" : "#2a3848"}
                style={{ fontFamily: MO, fontSize: 7.5, fontWeight: isT ? 700 : 400 }}>
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
        <text x={PX + CW + 4} y={yThresh + 4} fill="#ff4455"
          style={{ fontFamily: MO, fontSize: 8, fontWeight: 700 }}>← THRESHOLD</text>
        {dangerAbove
          ? <rect x={PX} y={PY} width={CW} height={yThresh - PY} fill="rgba(255,68,85,0.04)" />
          : <rect x={PX} y={yThresh} width={CW} height={(PY + CH) - yThresh} fill="rgba(255,68,85,0.04)" />
        }
        <path d={pathD} fill="none" stroke="#1a2a40" strokeWidth="1.5" />
        {scores.map((s, i) => {
          if (i === 0 || s === null || scores[i - 1] === null) return null;
          const x1 = xOf(i - 1), y1 = yOf(scores[i - 1]);
          const x2 = xOf(i), y2 = yOf(s);
          const col = dotColor(s);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${col}88`} strokeWidth="2" strokeLinecap="round" />;
        })}
        {scores.map((s, i) => {
          const x = xOf(i);
          const effectiveS = s ?? scores[i - 1] ?? scores[0];
          const y = yOf(effectiveS);
          const isActive = i === currentIdx;
          const col = dotColor(s);
          return (
            <g key={i}>
              {isActive && <circle cx={x} cy={y} r={10} fill={`${col}18`} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />}
              <circle cx={x} cy={y} r={isActive ? 5.5 : 3}
                fill={isActive ? col : `${col}88`}
                style={isActive ? { filter: `drop-shadow(0 0 6px ${col})` } : {}}
                stroke={isActive ? "#070b12" : "none"} strokeWidth="1.5" />
              {years[i].isCollapse && (
                <text x={x} y={y - 10} textAnchor="middle" fill="#ff4455"
                  style={{ fontFamily: MO, fontSize: 9, fontWeight: 700 }}>✕</text>
              )}
            </g>
          );
        })}
        {years.map((yr, i) => (
          <text key={i} x={xOf(i)} y={VH - 2} textAnchor="middle"
            fill={i === currentIdx ? dotColor(yr[scoreKey]) : "#2a3848"}
            style={{ fontFamily: MO, fontSize: 8, fontWeight: i === currentIdx ? 700 : 400 }}>
            {yr.year}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── TIMELINE NODES ───────────────────────────────────────────────────────────
function TimelineNodes({ years, currentIdx, onSelect, scoreKey, threshold, dangerAbove = true }) {
  const dotColor = (s) => {
    if (s === null) return "#ff4455";
    if (dangerAbove ? s > threshold : s < threshold) return "#ff4455";
    return "#00ff88";
  };
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      {years.map((yr, i) => {
        const isActive = i === currentIdx;
        const isPast = i <= currentIdx;
        const col = yr.isCollapse ? "#ff4455" : dotColor(yr[scoreKey]);
        const nCol = i < years.length - 1
          ? (years[i + 1].isCollapse ? "#ff4455" : dotColor(years[i + 1][scoreKey]))
          : col;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < years.length - 1 ? 1 : "none" }}>
            <button onClick={() => onSelect(i)} title={`${yr.year}: ${yr.phase}`} style={{
              all: "unset", cursor: "pointer", flexShrink: 0,
              width: isActive ? 18 : 11, height: isActive ? 18 : 11,
              borderRadius: "50%",
              background: isPast ? col : "#1a2535",
              border: `2px solid ${isPast ? col : "#1a2535"}`,
              boxShadow: isActive ? `0 0 14px ${col}99` : "none",
              transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
            }} />
            {i < years.length - 1 && (
              <div style={{
                flex: 1, height: 2, borderRadius: 1,
                background: i < currentIdx
                  ? `linear-gradient(90deg, ${col}, ${nCol})`
                  : "#1a2535",
                transition: "background 0.4s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN REPLAY COMPONENT ───────────────────────────────────────────────────
export default function CaseStudyReplay({ scandal }) {
  const {
    years,
    thresholds,
    metricInfo,
    scoreKey = "mscore",
    scoreLabel = "BENEISH M-SCORE",
    scoreThreshold = -1.78,
    scoreDangerAbove = false, // false = danger when score goes ABOVE threshold (less negative)
    scoreYMin, scoreYMax,
    fraudValueKey = "fraudValue",
    fraudValueLabel = "FABRICATED ENTRIES",
    fraudValueUnit = "₹",
    fraudValueSuffix = " Cr",
    fraudValuePeak,
    accentColor = "#ff4455",
    verdictText,
    breachYear,
  } = scandal;

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2500);
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [flash, setFlash] = useState(false);
  const intervalRef = useRef(null);
  const eventTimers = useRef([]);

  const data = years[idx];
  const score = data[scoreKey];
  const isFraud = score !== null && (scoreDangerAbove ? score > scoreThreshold : score > scoreThreshold);
  const mCol = score === null ? "#ff4455"
    : (scoreDangerAbove ? score > scoreThreshold : score > scoreThreshold) ? "#ff4455"
    : score > scoreThreshold - 0.4 ? "#ffb020"
    : "#00ff88";
  const yearGlow = isFraud || data.isCollapse
    ? `0 0 60px rgba(255,68,85,0.25), 0 0 120px rgba(255,68,85,0.1)`
    : "none";

  useEffect(() => {
    eventTimers.current.forEach(clearTimeout);
    eventTimers.current = [];
    setVisibleEvents(0);
    setFlash(true);
    const ft = setTimeout(() => setFlash(false), 300);
    data.events.forEach((_, i) => {
      const t = setTimeout(() => setVisibleEvents(i + 1), 200 + i * 320);
      eventTimers.current.push(t);
    });
    return () => { clearTimeout(ft); eventTimers.current.forEach(clearTimeout); };
  }, [idx]);

  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setIdx(prev => {
        if (prev >= years.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [playing, speed]);

  const go = (i) => { setPlaying(false); setIdx(Math.max(0, Math.min(i, years.length - 1))); };
  const togglePlay = () => { if (idx >= years.length - 1) setIdx(0); setPlaying(p => !p); };

  const fraudVal = data[fraudValueKey] || 0;
  const fraudPct = fraudValuePeak ? (fraudVal / fraudValuePeak) * 100 : 0;

  const Btn = ({ onClick, disabled, children }) => {
    const [hov, setHov] = useState(false);
    return (
      <button onClick={onClick} disabled={disabled}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          all: "unset", cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: MO, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          padding: "8px 16px", borderRadius: 3,
          color: disabled ? "#2a3848" : hov ? accentColor : "#8892a4",
          background: disabled ? "transparent" : hov ? `${accentColor}12` : "transparent",
          border: `1px solid ${disabled ? "#1a2535" : hov ? `${accentColor}66` : "#2a3848"}`,
          transition: "all 0.15s",
          opacity: disabled ? 0.4 : 1,
        }}>{children}</button>
    );
  };

  return (
    <div style={{
      background: `radial-gradient(ellipse at 15% 40%, ${isFraud || data.isCollapse ? "rgba(255,68,85,0.07)" : "rgba(0,255,136,0.03)"} 0%, transparent 55%), #04070e`,
      border: "1px solid #100d16",
      borderTop: `2px solid ${accentColor}`,
      borderRadius: 4,
      overflow: "hidden",
      transition: "background 0.8s",
    }}>

      {/* HEADER */}
      <div style={{
        padding: "22px 32px 18px",
        borderBottom: "1px solid #0f1520",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: MO, fontSize: 9, color: accentColor, letterSpacing: "0.22em", marginBottom: 7, fontWeight: 700 }}>
            ◈ CASE STUDY · {scandal.companyName} · {scandal.ticker}
          </div>
          <div style={{ fontFamily: SA, fontSize: 20, fontWeight: 800, color: "#e8f0f8", letterSpacing: "-0.02em" }}>
            {scandal.title} <span style={{ color: accentColor }}>{years[0].year} – {years[years.length - 1].year}</span>
          </div>
          <div style={{ fontFamily: SA, fontSize: 13, color: "#5a6a80", marginTop: 5, lineHeight: 1.5 }}>
            {scandal.subtitle}
          </div>
        </div>
        <div style={{
          fontFamily: MO, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          padding: "8px 16px", borderRadius: 3,
          color: data.phaseColor,
          background: `${data.phaseColor}14`,
          border: `1px solid ${data.phaseColor}44`,
          transition: "all 0.4s",
          animation: data.isCollapse ? "critPulse 1.8s ease-in-out infinite" : "none",
        }}>{data.phase}</div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}>

        {/* LEFT */}
        <div style={{
          padding: "28px 28px 28px 32px",
          borderRight: "1px solid #0f1520",
          display: "flex", flexDirection: "column", gap: 22,
        }}>
          {/* Year */}
          <div>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.18em", marginBottom: 8, fontWeight: 600 }}>
              FISCAL YEAR
            </div>
            <div style={{
              fontFamily: MO, fontSize: 88, fontWeight: 700, lineHeight: 0.85,
              color: mCol, textShadow: yearGlow, letterSpacing: "-3px",
              opacity: flash ? 0.15 : 1,
              transition: "opacity 0.08s, color 0.5s, text-shadow 0.5s",
            }}>{data.year}</div>
          </div>

          {/* Score card */}
          <div style={{
            background: "#070b12", border: `1px solid ${mCol}33`,
            borderLeft: `3px solid ${mCol}`, borderRadius: 4, padding: "14px 16px",
          }}>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.14em", marginBottom: 8, fontWeight: 600 }}>
              {scoreLabel}
            </div>
            <div style={{
              fontFamily: MO, fontSize: 36, fontWeight: 700, color: mCol, lineHeight: 1,
              textShadow: `0 0 20px ${mCol}55`, transition: "color 0.5s",
            }}>
              {score !== null ? Number(score).toFixed(2) : "N/A"}
            </div>
            <div style={{ fontFamily: MO, fontSize: 9, fontWeight: 700, color: mCol, letterSpacing: "0.12em", marginTop: 8 }}>
              {data.isCollapse ? "◉ FRAUD CONFIRMED"
                : isFraud ? "▲ MANIPULATION LIKELY"
                : "✓ BELOW THRESHOLD"}
            </div>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4060", marginTop: 5 }}>
              threshold: {scoreThreshold}
            </div>
          </div>

          {/* Fraud value bar */}
          <div>
            <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.14em", marginBottom: 8, fontWeight: 600 }}>
              {fraudValueLabel}
            </div>
            {fraudVal === 0 ? (
              <div style={{ fontFamily: MO, fontSize: 18, fontWeight: 700, color: "#00ff88" }}>NONE</div>
            ) : (
              <>
                <div style={{ fontFamily: MO, fontSize: 24, fontWeight: 700, color: "#ff4455", lineHeight: 1, textShadow: "0 0 16px rgba(255,68,85,0.44)" }}>
                  {fraudValueUnit}{typeof fraudVal === "number" ? fraudVal.toLocaleString() : fraudVal}{fraudValueSuffix}
                </div>
                {fraudValuePeak && (
                  <>
                    <div style={{ height: 5, background: "#0c1018", borderRadius: 3, marginTop: 10, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${fraudPct}%`,
                        background: "linear-gradient(90deg,#ff445588,#ff4455)",
                        borderRadius: 3, boxShadow: "0 0 10px rgba(255,68,85,0.5)",
                        transition: "width 0.9s cubic-bezier(.23,1,.32,1)",
                      }} />
                    </div>
                    <div style={{ fontFamily: MO, fontSize: 8, color: "#3a4060", marginTop: 5, display: "flex", justifyContent: "space-between" }}>
                      <span>0</span>
                      <span style={{ color: "#ff445577" }}>{fraudPct.toFixed(0)}% of peak</span>
                      <span>{fraudValueUnit}{(fraudValuePeak).toLocaleString()}{fraudValueSuffix}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ padding: "28px 32px 28px 28px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontFamily: SA, fontSize: 22, fontWeight: 800, color: "#e8f0f8", margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {data.headline}
          </h2>
          <p style={{ fontFamily: SA, fontSize: 14, color: "#6a7a8e", lineHeight: 1.85, margin: "0 0 22px" }}>
            {data.body}
          </p>
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
                {verdictText || `The fraud signal appeared in ${breachYear} — years before the public collapse. The data was always there.`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* METRIC TILES */}
      <div style={{ borderTop: "1px solid #0f1520", padding: "20px 32px", background: "#03060c" }}>
        <div style={{ fontFamily: MO, fontSize: 9, color: "#3a4a60", letterSpacing: "0.18em", marginBottom: 14, fontWeight: 600 }}>
          {scandal.metricsLabel || "KEY INDICATORS"} · YEAR {data.year}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Object.keys(data.metrics).length}, 1fr)`, gap: 10 }}>
          {Object.entries(data.metrics).map(([k, v]) => (
            <MetricTile key={k} metricKey={k} value={v} thresholds={thresholds} metricInfo={metricInfo} accentColor={accentColor} />
          ))}
        </div>
      </div>

      {/* SCORE TRAJECTORY */}
      <div style={{ borderTop: "1px solid #0f1520", padding: "20px 32px", background: "#04070e" }}>
        <ScoreTrack
          years={years} currentIdx={idx}
          scoreKey={scoreKey} threshold={scoreThreshold}
          label={scoreLabel} yMin={scoreYMin} yMax={scoreYMax}
          dangerAbove={scoreDangerAbove}
        />
      </div>

      {/* CONTROLS */}
      <div style={{ borderTop: "1px solid #0f1520", padding: "18px 32px 22px", background: "#03060c", display: "flex", flexDirection: "column", gap: 16 }}>
        <TimelineNodes years={years} currentIdx={idx} onSelect={go} scoreKey={scoreKey} threshold={scoreThreshold} dangerAbove={scoreDangerAbove} />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: -10 }}>
          {years.map((yr, i) => (
            <button key={i} onClick={() => go(i)} style={{
              all: "unset", cursor: "pointer",
              fontFamily: MO, fontSize: 9, fontWeight: i === idx ? 700 : 400,
              color: i === idx ? mCol : "#2a3848",
              transition: "color 0.2s",
            }}>{yr.year}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingTop: 6, borderTop: "1px solid #0a1018" }}>
          <Btn onClick={() => go(idx - 1)} disabled={idx === 0}>◀ PREV</Btn>
          <button onClick={togglePlay} style={{
            all: "unset", cursor: "pointer",
            fontFamily: MO, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            padding: "10px 28px", borderRadius: 3,
            background: playing ? `rgba(255,68,85,0.12)` : accentColor,
            color: playing ? accentColor : "#070b12",
            border: playing ? `1px solid ${accentColor}66` : "none",
            transition: "all 0.15s", minWidth: 110, textAlign: "center",
          }}>
            {playing ? "⏸ PAUSE" : idx >= years.length - 1 ? "↺ REPLAY" : "▶ PLAY"}
          </button>
          <Btn onClick={() => go(idx + 1)} disabled={idx === years.length - 1}>NEXT ▶</Btn>
          <div style={{ fontFamily: MO, fontSize: 10, color: "#3a4a60", marginLeft: 4 }}>
            {idx + 1} / {years.length}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: MO, fontSize: 9, color: "#2a3848", marginRight: 4 }}>SPEED</span>
            {[[3000, "0.5×"], [2000, "1×"], [1000, "2×"], [500, "4×"]].map(([ms, lbl]) => (
              <button key={ms} onClick={() => setSpeed(ms)} style={{
                all: "unset", cursor: "pointer",
                fontFamily: MO, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                padding: "5px 12px", borderRadius: 3,
                color: speed === ms ? accentColor : "#3a4a60",
                background: speed === ms ? `${accentColor}18` : "transparent",
                border: `1px solid ${speed === ms ? `${accentColor}44` : "#1a2535"}`,
                transition: "all 0.1s",
              }}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes critPulse{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>
    </div>
  );
}
