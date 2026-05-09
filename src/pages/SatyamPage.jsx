import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SatyamReplaySection from "../components/SatyamReplaySection";
import Navbar from "../components/Navbar";

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

      <Navbar />

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
