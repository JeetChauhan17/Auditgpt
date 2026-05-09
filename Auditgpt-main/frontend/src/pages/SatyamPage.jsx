import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SatyamReplaySection from "../components/SatyamReplaySection";

const MO = "'JetBrains Mono', monospace";
const SA = "'Space Grotesk', sans-serif";

const Scanlines = () => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.055) 3px,rgba(0,0,0,0.055) 4px)",
  }} />
);

export default function SatyamPage() {
  const navigate = useNavigate();
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#070b12", color: "#c0ccd8" }}>
      <Scanlines />

      {/* NAV */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200, height: 48,
        display: "flex", alignItems: "center", padding: "0 28px",
        background: "#070b12ee", backdropFilter: "blur(14px)",
        borderBottom: "1px solid #131c28",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginRight: 24 }}>
          <div style={{ width: 26, height: 26, borderRadius: 3, background: "linear-gradient(135deg,#00ff88,#00d4ff)", display: "grid", placeItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#070b12", fontFamily: SA }}>A</span>
          </div>
          <span style={{ fontFamily: SA, fontSize: 13, fontWeight: 700, color: "#e0eaf4" }}>
            Audit<span style={{ color: "#00ff88" }}>GPT</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MO, fontSize: 10 }}>
          <span onClick={() => navigate("/radar")} style={{ color: "#2a3850", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.color = "#5a6a80"}
            onMouseLeave={e => e.target.style.color = "#2a3850"}>RADAR</span>
          <span style={{ color: "#131c28" }}>›</span>
          <span style={{ color: "#ff4455", letterSpacing: "0.06em" }}>SATYAM CASE STUDY</span>
        </div>

        <div style={{ marginLeft: "auto", fontFamily: MO, fontSize: 9, textAlign: "right", lineHeight: 1.6 }}>
          <div style={{ color: "#00ff88" }}>{t.toLocaleTimeString("en-IN", { hour12: false })} IST</div>
          <div style={{ color: "#1e2838" }}>{t.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        </div>
      </header>

      {/* accent strip */}
      <div style={{ height: 2, background: "linear-gradient(90deg,#ff4455 0%,#ff445544 55%,transparent 100%)" }} />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 26px 80px" }}>
        <SatyamReplaySection />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        body{margin:0;background:#070b12;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#070b12}
        ::-webkit-scrollbar-thumb{background:#111c2a;border-radius:2px}
      `}</style>
    </div>
  );
}
