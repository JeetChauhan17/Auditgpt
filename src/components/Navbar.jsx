import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MO = "'JetBrains Mono', monospace";
const SA = "'Space Grotesk', sans-serif";

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [t, setT] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const path = location.pathname;
  const isHome = path === "/";

  // which page are we on?
  const active = (p) => path === p || path.startsWith(p + "/");

  const PageLink = ({ to, label, danger }) => {
    const [hov, setHov] = useState(false);
    const isActive = active(to);
    const col = danger
      ? isActive ? "#ff4455" : hov ? "#ff4455" : "#4a2535"
      : isActive ? "#00ff88" : hov ? "#c0d0e0" : "#3a4a62";

    return (
      <button
        onClick={() => navigate(to)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          all: "unset",
          cursor: "pointer",
          fontFamily: MO,
          fontSize: 10,
          fontWeight: isActive ? 700 : 600,
          letterSpacing: "0.07em",
          padding: "5px 11px",
          borderRadius: 3,
          color: col,
          background: isActive
            ? danger ? "rgba(255,68,85,0.08)" : "rgba(0,255,136,0.07)"
            : hov
              ? "rgba(255,255,255,0.03)"
              : "transparent",
          border: isActive
            ? `1px solid ${danger ? "rgba(255,68,85,0.25)" : "rgba(0,255,136,0.2)"}`
            : "1px solid transparent",
          transition: "all 0.15s ease",
          whiteSpace: "nowrap",
        }}
      >
        {isActive && <span style={{ marginRight: 5, opacity: 0.6 }}>›</span>}
        {label}
      </button>
    );
  };

  const AnchorLink = ({ id, label }) => {
    const [hov, setHov] = useState(false);
    return (
      <button
        onClick={() => isHome ? scrollTo(id) : navigate("/")}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          all: "unset",
          cursor: "pointer",
          fontFamily: MO,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.06em",
          padding: "5px 11px",
          borderRadius: 3,
          color: hov ? "#7a8a9a" : "#2a3850",
          background: hov ? "rgba(255,255,255,0.02)" : "transparent",
          transition: "all 0.15s ease",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    );
  };

  const Sep = () => (
    <div style={{
      width: 1, height: 16,
      background: "#131c28",
      margin: "0 6px",
      flexShrink: 0,
    }} />
  );

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 200,
      height: 50,
      display: "flex",
      alignItems: "center",
      padding: "0 28px",
      background: "rgba(7,11,18,0.97)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #0d1622",
      gap: 0,
    }}>

      {/* ── LOGO ── */}
      <button
        onClick={() => navigate("/")}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginRight: 20,
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 3,
          background: "linear-gradient(135deg,#00ff88,#00d4ff)",
          display: "grid", placeItems: "center",
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#070b12", fontFamily: SA }}>A</span>
        </div>
        <span style={{ fontFamily: SA, fontSize: 14, fontWeight: 700, color: "#d0dce8" }}>
          Audit<span style={{ color: "#00ff88" }}>GPT</span>
        </span>
      </button>

      <Sep />

      {/* ── NAV LINKS ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        flex: 1,
        overflow: "hidden",
      }}>

        {/* Same-page anchors — only make sense from home, otherwise they nav back */}
        <AnchorLink id="how"      label="How It Works" />
        <AnchorLink id="features" label="Features"     />
        <AnchorLink id="models"   label="Models"       />

        <Sep />

        {/* App pages */}
        <PageLink to="/radar"    label="Fraud Radar"      />
        <PageLink to="/critical" label="Critical Section" />
        <PageLink to="/cases"   label="Real Cases" danger />

      </div>

      {/* ── RIGHT: clock + CTA ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>

        <div style={{
          fontFamily: MO, fontSize: 9,
          textAlign: "right", lineHeight: 1.7,
        }}>
          <div style={{ color: "#00ff88" }}>
            {t.toLocaleTimeString("en-IN", { hour12: false })} IST
          </div>
          <div style={{ color: "#1e2838" }}>
            {t.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>

        <button
          onClick={() => navigate("/radar")}
          style={{
            all: "unset",
            cursor: "pointer",
            fontFamily: MO,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "7px 16px",
            borderRadius: 3,
            background: "#00ff88",
            color: "#070b12",
            transition: "background 0.15s, box-shadow 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#00dd77";
            e.currentTarget.style.boxShadow = "0 0 14px rgba(0,255,136,0.35)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#00ff88";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Run Analysis →
        </button>

      </div>
    </header>
  );
}
