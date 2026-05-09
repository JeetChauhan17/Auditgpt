// import { useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Home.css';

// // ── Counter animation helper ──────────────────────────────────────────────
// function animateCount(el, target, duration) {
//   if (!el) return;
//   let start = 0;
//   const step = target / (duration / 16);
//   const timer = setInterval(() => {
//     start = Math.min(start + step, target);
//     el.textContent = Math.floor(start);
//     if (start >= target) clearInterval(timer);
//   }, 16);
// }

// export default function Home() {
//   const navigate = useNavigate();
//   const compCountRef = useRef(null);
//   const demoScoreRef = useRef(null);

//   // Hero counter starts after 600ms
//   useEffect(() => {
//     const t = setTimeout(() => animateCount(compCountRef.current, 1847, 1800), 600);
//     return () => clearTimeout(t);
//   }, []);

//   // Demo score counts when scrolled into view
//   useEffect(() => {
//     const el = demoScoreRef.current;
//     if (!el) return;
//     const obs = new IntersectionObserver(entries => {
//       entries.forEach(e => {
//         if (e.isIntersecting) {
//           animateCount(el, 82, 1200);
//           obs.disconnect();
//         }
//       });
//     });
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, []);

//   // Scroll reveal
//   useEffect(() => {
//     const reveals = document.querySelectorAll('.reveal');
//     const obs = new IntersectionObserver(entries => {
//       entries.forEach(e => {
//         if (e.isIntersecting) e.target.classList.add('visible');
//       });
//     }, { threshold: 0.1 });
//     reveals.forEach(r => obs.observe(r));
//     return () => obs.disconnect();
//   }, []);

//   return (
//     <>
//       {/* ── NAV ── */}
//       <nav className="home-nav">
//         <span className="nav-logo">AuditGPT<em> // v2.4</em></span>
//         <div className="nav-links">
//           <a href="#how" className="nav-link">How It Works</a>
//           <a href="#features" className="nav-link">Features</a>
//           <a href="#models" className="nav-link">Models</a>
//           <span className="nav-cta" onClick={() => navigate('/radar')} style={{cursor:'pointer'}}>Live Demo →</span>
//         </div>
//       </nav>

//       {/* ── HERO ── */}
//       <section className="hero">
//         <div className="hero-eyebrow">NSE Forensic Intelligence Engine</div>
//         <h1 className="hero-headline">
//           <span className="line-dim">Fraud doesn't hide.</span><br />
//           <span className="line-green">It leaves traces.</span>
//         </h1>
//         <p className="hero-sub">
//           AuditGPT applies quantitative forensic models and LLM-powered narrative analysis
//           to detect financial manipulation in NSE-listed companies — before it becomes a headline.
//         </p>
//         <div className="hero-actions">
//           <span className="btn-primary" onClick={() => navigate('/radar')} style={{cursor:'pointer'}}>
//             Run Forensic Analysis
//           </span>
//           <a href="#how" className="btn-secondary">See How It Works</a>
//         </div>
//         <div className="hero-stats">
//           <div className="stat-item">
//             <div className="stat-num green" ref={compCountRef}>0</div>
//             <div className="stat-label">NSE Companies Screened</div>
//           </div>
//           <div className="stat-item">
//             <div className="stat-num red">14</div>
//             <div className="stat-label">Active Fraud Flags</div>
//           </div>
//           <div className="stat-item">
//             <div className="stat-num cyan">8</div>
//             <div className="stat-label">Detection Models</div>
//           </div>
//           <div className="stat-item">
//             <div className="stat-num amber">92%</div>
//             <div className="stat-label">Backtested Accuracy</div>
//           </div>
//         </div>
//       </section>

//       {/* ── LIVE DEMO STRIP ── */}
//       <div className="demo-strip" id="demo">
//         <div className="demo-inner">
//           <div>
//             <div className="demo-label">● Live Analysis Sample</div>
//             <div className="demo-company">Inflection Infra Ltd.</div>
//             <div className="demo-ticker">NSE: INFRATECH · Construction · Large Cap</div>
//             <div className="score-display">
//               <div className="score-big" ref={demoScoreRef}>0</div>
//               <div className="score-aside">
//                 <div className="verdict-chip">
//                   <span className="verdict-dot"></span> Critical Risk
//                 </div>
//                 <div className="score-desc-sm">
//                   14 anomaly flags detected across 5 fiscal years. Pattern matches Satyam trajectory at 78%.
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div>
//             <div className="demo-heatmap-title">Anomaly Heatmap — FY2020 → FY2024</div>
//             <div className="mini-heatmap">
//               <div className="mh-corner"></div>
//               <div className="mh-col">FY20</div><div className="mh-col">FY21</div>
//               <div className="mh-col">FY22</div><div className="mh-col">FY23</div><div className="mh-col">FY24</div>

//               <div className="mh-row-label">Revenue Quality</div>
//               <div className="mh-cell mh-1">2.1</div><div className="mh-cell mh-1">2.8</div>
//               <div className="mh-cell mh-2">4.2</div><div className="mh-cell mh-3">6.7</div><div className="mh-cell mh-4">8.9</div>

//               <div className="mh-row-label">Cash Conversion</div>
//               <div className="mh-cell mh-0">1.2</div><div className="mh-cell mh-1">2.4</div>
//               <div className="mh-cell mh-2">4.8</div><div className="mh-cell mh-4">7.9</div><div className="mh-cell mh-4">9.1</div>

//               <div className="mh-row-label">Receivables</div>
//               <div className="mh-cell mh-0">1.0</div><div className="mh-cell mh-0">1.5</div>
//               <div className="mh-cell mh-1">3.1</div><div className="mh-cell mh-2">5.4</div><div className="mh-cell mh-3">7.2</div>

//               <div className="mh-row-label">Related Party</div>
//               <div className="mh-cell mh-1">3.0</div><div className="mh-cell mh-2">4.2</div>
//               <div className="mh-cell mh-3">6.0</div><div className="mh-cell mh-4">8.1</div><div className="mh-cell mh-4">9.4</div>

//               <div className="mh-row-label">Leverage</div>
//               <div className="mh-cell mh-1">2.3</div><div className="mh-cell mh-2">4.0</div>
//               <div className="mh-cell mh-2">4.5</div><div className="mh-cell mh-3">6.1</div><div className="mh-cell mh-3">6.8</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── HOW IT WORKS ── */}
//       <section className="home-section reveal" id="how">
//         <div className="section-tag">// Process</div>
//         <h2 className="section-heading">How <em>AuditGPT</em> works</h2>
//         <p className="section-sub">Four steps from raw financial data to actionable forensic intelligence — fully automated.</p>
//         <div className="steps-grid">
//           <div className="step-card">
//             <div className="step-num">01</div>
//             <div className="step-title">Data Ingestion</div>
//             <div className="step-desc">NSE financial disclosures, annual reports, and BSE filings are automatically parsed and normalized across 5 fiscal years.</div>
//             <span className="step-tag green">Automated</span>
//           </div>
//           <div className="step-card">
//             <div className="step-num">02</div>
//             <div className="step-title">Quantitative Scoring</div>
//             <div className="step-desc">Beneish M-Score, Altman Z-Score, and industry-adjusted models run simultaneously across 40+ financial ratios.</div>
//             <span className="step-tag cyan">Multi-Model</span>
//           </div>
//           <div className="step-card">
//             <div className="step-num">03</div>
//             <div className="step-title">Anomaly Detection</div>
//             <div className="step-desc">Cross-dimensional heatmaps identify temporal patterns. Statistical outliers flagged at 2σ and 3σ thresholds. Related party networks mapped.</div>
//             <span className="step-tag amber">AI-Powered</span>
//           </div>
//           <div className="step-card">
//             <div className="step-num">04</div>
//             <div className="step-title">LLM Narrative</div>
//             <div className="step-desc">An LLM synthesizes all quantitative signals into plain-language forensic narrative — actionable for auditors, analysts, and regulators.</div>
//             <span className="step-tag red">Gemini</span>
//           </div>
//         </div>
//       </section>

//       {/* ── FEATURES ── */}
//       <div className="features-wrap" id="features">
//         <div className="features-inner">
//           <div className="section-tag reveal">// Capabilities</div>
//           <h2 className="section-heading reveal">Every angle.<br /><em>No blind spots.</em></h2>
//           <p className="section-sub reveal">AuditGPT combines six forensic disciplines into a single unified platform.</p>
//           <div className="features-grid reveal">
//             <div className="feature-card">
//               <span className="feature-icon green">M</span>
//               <div className="feature-title">Earnings Manipulation</div>
//               <div className="feature-desc">Beneish M-Score decomposition with all 8 variables individually scored and charted over time.</div>
//               <div className="feature-bullets">
//                 <div className="feature-bullet">Days Sales Outstanding ratio</div>
//                 <div className="feature-bullet">Gross Margin Index deterioration</div>
//                 <div className="feature-bullet">Total Accruals to Total Assets</div>
//                 <div className="feature-bullet">Sales Growth Index vs peers</div>
//               </div>
//             </div>
//             <div className="feature-card red-accent">
//               <span className="feature-icon red">⚡</span>
//               <div className="feature-title">Cash Flow Forensics</div>
//               <div className="feature-desc">Detects phantom income via CFO/Net Income divergence analysis — the oldest fraud signal in the book.</div>
//               <div className="feature-bullets">
//                 <div className="feature-bullet">CFO to reported profit ratio tracking</div>
//                 <div className="feature-bullet">Working capital anomaly detection</div>
//                 <div className="feature-bullet">Capex to depreciation mismatch</div>
//                 <div className="feature-bullet">Free cash flow quality scoring</div>
//               </div>
//             </div>
//             <div className="feature-card cyan-accent">
//               <span className="feature-icon cyan">◈</span>
//               <div className="feature-title">Related Party Mapping</div>
//               <div className="feature-desc">Network graph of related party transactions. Unregistered entities flagged. Revenue concentration measured.</div>
//               <div className="feature-bullets">
//                 <div className="feature-bullet">Director overlap detection</div>
//                 <div className="feature-bullet">Revenue concentration risk</div>
//                 <div className="feature-bullet">Circular transaction patterns</div>
//                 <div className="feature-bullet">Shell entity identification</div>
//               </div>
//             </div>
//             <div className="feature-card amber-accent">
//               <span className="feature-icon amber">Z</span>
//               <div className="feature-title">Distress Analysis</div>
//               <div className="feature-desc">Altman Z-Score with full working capital, retained earnings, EBIT and equity decomposition. Bankruptcy prediction.</div>
//               <div className="feature-bullets">
//                 <div className="feature-bullet">Safe / grey / distress zone tracking</div>
//                 <div className="feature-bullet">Promoter pledge % over time</div>
//                 <div className="feature-bullet">Debt covenant proximity analysis</div>
//                 <div className="feature-bullet">Liquidity stress indicators</div>
//               </div>
//             </div>
//             <div className="feature-card">
//               <span className="feature-icon cyan">▲</span>
//               <div className="feature-title">Case Comparable Matching</div>
//               <div className="feature-desc">Pattern similarity engine matches current company trajectory against known fraud cases — Satyam, DHFL, IL&FS, Yes Bank.</div>
//               <div className="feature-bullets">
//                 <div className="feature-bullet">Multi-dimensional similarity scoring</div>
//                 <div className="feature-bullet">Year-by-year trajectory replay</div>
//                 <div className="feature-bullet">Industry-normalized comparison</div>
//               </div>
//             </div>
//             <div className="feature-card red-accent">
//               <span className="feature-icon green">◎</span>
//               <div className="feature-title">AI Forensic Narrative</div>
//               <div className="feature-desc">LLM-generated analyst-grade narrative synthesizing all signals. Streaming output. Citation-linked to specific data points.</div>
//               <div className="feature-bullets">
//                 <div className="feature-bullet">Plain-language fraud hypotheses</div>
//                 <div className="feature-bullet">Quantitative evidence mapping</div>
//                 <div className="feature-bullet">Regulatory referral recommendations</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── MODELS ── */}
//       <div className="models-section reveal" id="models">
//         <div className="section-tag">// Detection Engine</div>
//         <h2 className="section-heading" style={{marginBottom:'12px'}}>Powered by <em>proven models</em></h2>
//         <p className="section-sub">Every model backtested on Indian market fraud cases going back to 2001.</p>
//         <div className="models-grid">
//           <div className="model-card">
//             <div className="model-name">Beneish</div>
//             <div className="model-full">M-Score Earnings Manipulation Model (8-variable)</div>
//             <div className="model-use">Primary Use</div>
//             <div className="model-use-val">Earnings quality, accruals manipulation</div>
//             <div className="model-divider"></div>
//             <div className="model-accuracy">
//               <div className="model-acc-val">76%</div>
//               <div className="model-acc-label">Detection rate<br />on NSE corpus</div>
//             </div>
//           </div>
//           <div className="model-card">
//             <div className="model-name">Altman</div>
//             <div className="model-full">Z-Score Financial Distress Predictor</div>
//             <div className="model-use">Primary Use</div>
//             <div className="model-use-val">Bankruptcy prediction, financial health</div>
//             <div className="model-divider"></div>
//             <div className="model-accuracy">
//               <div className="model-acc-val">82%</div>
//               <div className="model-acc-label">2-year prediction<br />accuracy</div>
//             </div>
//           </div>
//           <div className="model-card">
//             <div className="model-name">Industry Z</div>
//             <div className="model-full">Sector-Adjusted Z-Score Anomaly Detection</div>
//             <div className="model-use">Primary Use</div>
//             <div className="model-use-val">Peer deviation, ratio outlier detection</div>
//             <div className="model-divider"></div>
//             <div className="model-accuracy">
//               <div className="model-acc-val">71%</div>
//               <div className="model-acc-label">Anomaly detection<br />accuracy</div>
//             </div>
//           </div>
//           <div className="model-card">
//             <div className="model-name">Gemini</div>
//             <div className="model-full">LLM Forensic Narrative Synthesis</div>
//             <div className="model-use">Primary Use</div>
//             <div className="model-use-val">Pattern narrative, analyst-grade summary</div>
//             <div className="model-divider"></div>
//             <div className="model-accuracy">
//               <div className="model-acc-val">92%</div>
//               <div className="model-acc-label">Combined ensemble<br />accuracy</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── COMPARISON ── */}
//       <div className="compare-section reveal">
//         <div className="section-tag" style={{marginBottom:'16px'}}>// Why AuditGPT</div>
//         <h2 className="section-heading" style={{marginBottom:'48px'}}>vs. existing <em>tools</em></h2>
//         <table className="compare-table">
//           <thead>
//             <tr>
//               <th>Capability</th>
//               <th className="highlight">AuditGPT</th>
//               <th>Manual Audit</th>
//               <th>Bloomberg Terminal</th>
//               <th>Screener.in</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td className="feature-name">Multi-model fraud scoring</td>
//               <td className="yes highlight-col">✓ Automated</td>
//               <td className="no">✗ Manual</td>
//               <td className="no">✗ Partial</td>
//               <td className="no">✗ None</td>
//             </tr>
//             <tr>
//               <td className="feature-name">Temporal anomaly heatmap</td>
//               <td className="yes highlight-col">✓ 5-year view</td>
//               <td className="no">✗</td>
//               <td className="no">✗</td>
//               <td className="no">✗</td>
//             </tr>
//             <tr>
//               <td className="feature-name">Related party network mapping</td>
//               <td className="yes highlight-col">✓ Automated</td>
//               <td className="no">✗ Manual</td>
//               <td className="no">✗</td>
//               <td className="no">✗</td>
//             </tr>
//             <tr>
//               <td className="feature-name">LLM forensic narrative</td>
//               <td className="yes highlight-col">✓ Real-time</td>
//               <td className="no">✗</td>
//               <td className="no">✗</td>
//               <td className="no">✗</td>
//             </tr>
//             <tr>
//               <td className="feature-name">Historical fraud case comparables</td>
//               <td className="yes highlight-col">✓ Satyam, DHFL, IL&FS</td>
//               <td className="no">✗ Knowledge only</td>
//               <td className="no">✗</td>
//               <td className="no">✗</td>
//             </tr>
//             <tr>
//               <td className="feature-name">NSE/BSE filing integration</td>
//               <td className="yes highlight-col">✓ Live</td>
//               <td className="no">✗ Manual</td>
//               <td className="yes">✓ Paid API</td>
//               <td className="yes">✓ Delayed</td>
//             </tr>
//             <tr>
//               <td className="feature-name">Cost</td>
//               <td className="yes highlight-col">Free / Open</td>
//               <td className="no">₹15L+/year</td>
//               <td className="no">$25K+/year</td>
//               <td className="yes">₹2,400/year</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* ── TERMINAL ── */}
//       <div className="terminal-section">
//         <div className="terminal-inner">
//           <div className="reveal">
//             <div className="section-tag">// Under the Hood</div>
//             <h2 className="section-heading" style={{marginBottom:'16px'}}>Raw output,<br /><em>zero black box.</em></h2>
//             <p style={{fontSize:'17px', color:'var(--text-2)', lineHeight:'1.7', maxWidth:'420px'}}>
//               Every score is fully decomposed. Every flag is traced back to a specific financial line item. No mystery, no magic — just evidence.
//             </p>
//           </div>
//           <div className="terminal-window reveal">
//             <div className="terminal-bar">
//               <div className="t-dot"></div><div className="t-dot"></div><div className="t-dot"></div>
//               <div className="t-title">auditgpt — forensic engine v2.4</div>
//             </div>
//             <div className="terminal-body">
//               <span className="t-line"><span className="t-prompt">$</span> <span className="t-cmd">auditgpt analyze --ticker INFRATECH --years 5</span></span>
//               <span className="t-blank"></span>
//               <span className="t-line t-out">► Loading NSE financial statements (FY2020–2024)...</span>
//               <span className="t-line t-out">► Running Beneish 8-variable model...</span>
//               <span className="t-line"><span className="t-key">  M-Score     </span><span className="t-val-red">−1.74</span><span className="t-out">  [threshold: −2.22] ⚠ ABOVE</span></span>
//               <span className="t-line"><span className="t-key">  DSRI        </span><span className="t-val-red">1.89</span><span className="t-out">   [receivables inflation]</span></span>
//               <span className="t-line"><span className="t-key">  TATA        </span><span className="t-val-red">0.073</span><span className="t-out">  [accrual anomaly]</span></span>
//               <span className="t-blank"></span>
//               <span className="t-line t-out">► Running Altman Z-Score...</span>
//               <span className="t-line"><span className="t-key">  Z-Score     </span><span className="t-val-amber">1.23</span><span className="t-out">   [distress zone &lt;1.81]</span></span>
//               <span className="t-blank"></span>
//               <span className="t-line t-out">► Detecting related party anomalies...</span>
//               <span className="t-line"><span className="t-key">  RPT/Revenue </span><span className="t-val-red">38.4%</span><span className="t-out">  [3 unregistered entities]</span></span>
//               <span className="t-blank"></span>
//               <span className="t-line t-out">► Matching case comparables...</span>
//               <span className="t-line"><span className="t-key">  Satyam 2007 </span><span className="t-val-red">78%</span><span className="t-out">   match [CRITICAL]</span></span>
//               <span className="t-blank"></span>
//               <span className="t-line"><span className="t-key">  FRAUD SCORE </span><span className="t-val-red">82/100</span><span className="t-out"> ████████░░</span></span>
//               <span className="t-line"><span className="t-prompt">$</span> <span className="t-cursor"></span></span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── CTA ── */}
//       <section className="cta-section">
//         <div className="cta-tag">// Get Started</div>
//         <h2 className="cta-heading">Find the fraud<br /><span className="accent">before it finds you.</span></h2>
//         <p className="cta-sub">AuditGPT is open-source and built for the Indian market. Run your first forensic scan in under 60 seconds.</p>
//         <div className="cta-actions">
//           <span className="btn-primary" onClick={() => navigate('/radar')} style={{cursor:'pointer'}}>Launch AuditGPT →</span>
//           <a href="https://github.com" className="btn-secondary">View on GitHub</a>
//         </div>
//         <div className="stamp-wrap">
//           <div className="stamp">
//             <div className="stamp-text">REFER<br />TO<br />SEBI</div>
//           </div>
//         </div>
//       </section>

//       {/* ── FOOTER ── */}
//       <footer className="home-footer">
//         <div className="footer-brand">AuditGPT</div>
//         <div className="footer-note">NSE Forensic Intelligence · FY2026 · Not financial advice</div>
//         <div className="footer-links">
//           <a href="#" className="footer-link">Docs</a>
//           <a href="#" className="footer-link">GitHub</a>
//           <a href="#" className="footer-link">API</a>
//           <a href="#" className="footer-link">Contact</a>
//         </div>
//       </footer>
//     </>
//   );
// }


//-------
//HEHEHEHA
//---------------

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// ── Counter animation helper ──────────────────────────────────────────────
function animateCount(el, target, duration) {
  if (!el) return;
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start);
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ── Smooth scroll helper ──────────────────────────────────────────────────
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Home() {
  const navigate = useNavigate();
  const compCountRef = useRef(null);
  const demoScoreRef = useRef(null);

  // Hero counter starts after 600ms
  useEffect(() => {
    const t = setTimeout(() => animateCount(compCountRef.current, 1847, 1800), 600);
    return () => clearTimeout(t);
  }, []);

  // Demo score counts when scrolled into view
  useEffect(() => {
    const el = demoScoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(el, 82, 1200);
          obs.disconnect();
        }
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scroll reveal
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    reveals.forEach(r => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ── NAV ── */}
      {/* <nav className="home-nav">
        <span className="nav-logo">AuditGPT<em> // v2.4</em></span>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollTo('how')}>How It Works</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('models')}>Models</button>
          <span className="nav-cta" onClick={() => navigate('/radar')} style={{ cursor: 'pointer' }}>Live Demo →</span>
        </div>
      </nav> */}

      {/* ── NAV ── */}
      <nav className="home-nav">
        <span className="nav-logo">AuditGPT<em> // v2.4</em></span>

        <div className="nav-divider" />

        <div className="nav-links">

          {/* ── same-page anchors ── */}
          <button className="nav-link" onClick={() => scrollTo('how')}>How It Works</button>
          <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="nav-link" onClick={() => scrollTo('models')}>Models</button>

          {/* ── separator ── */}
          <div className="nav-sep" />

          {/* ── app pages ── */}
          <button className="nav-page-link" onClick={() => navigate('/radar')}>
            Fraud Radar
          </button>
          <button className="nav-page-link" onClick={() => navigate('/critical')}>
            Critical Section
          </button>
          <button className="nav-page-link nav-satyam" onClick={() => navigate('/cases')}>
            Real Cases
          </button>

        </div>

        {/* ── CTA ── */}
        <button className="nav-cta" onClick={() => navigate('/radar')}>
          Run Analysis →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-eyebrow">NSE Forensic Intelligence Engine</div>
        <h1 className="hero-headline">
          <span className="line-dim">Fraud doesn't hide.</span><br />
          <span className="line-green">It leaves traces.</span>
        </h1>
        <p className="hero-sub">
          AuditGPT applies quantitative forensic models and LLM-powered narrative analysis
          to detect financial manipulation in NSE-listed companies — before it becomes a headline.
        </p>
        <div className="hero-actions">
          <span className="btn-primary" onClick={() => navigate('/radar')} style={{ cursor: 'pointer' }}>
            Run Forensic Analysis
          </span>
          <button className="btn-secondary" onClick={() => scrollTo('how')}>See How It Works</button>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-num green" ref={compCountRef}>0</div>
            <div className="stat-label">NSE Companies Screened</div>
          </div>
          <div className="stat-item">
            <div className="stat-num red">14</div>
            <div className="stat-label">Active Fraud Flags</div>
          </div>
          <div className="stat-item">
            <div className="stat-num cyan">8</div>
            <div className="stat-label">Detection Models</div>
          </div>
          <div className="stat-item">
            <div className="stat-num amber">92%</div>
            <div className="stat-label">Backtested Accuracy</div>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO STRIP ── */}
      <div className="demo-strip" id="demo">
        <div className="demo-inner">

          {/* LEFT: score card */}
          <div className="demo-score-col">
            <div className="demo-label">● Live Analysis Sample</div>
            <div className="demo-company">Inflection Infra Ltd.</div>
            <div className="demo-ticker">NSE: INFRATECH · Construction · Large Cap</div>
            <div className="score-display">
              <div className="score-big" ref={demoScoreRef}>0</div>
              <div className="score-aside">
                <div className="verdict-chip">
                  <span className="verdict-dot"></span> Critical Risk
                </div>
                <div className="score-desc-sm">
                  14 anomaly flags detected across 5 fiscal years. Pattern matches Satyam trajectory at 78%.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: heatmap */}
          <div className="demo-heatmap-col">
            <div className="demo-heatmap-title">Anomaly Heatmap — FY2020 → FY2024</div>
            <div className="mini-heatmap">
              {/* header row */}
              <div className="mh-corner"></div>
              <div className="mh-col">FY20</div>
              <div className="mh-col">FY21</div>
              <div className="mh-col">FY22</div>
              <div className="mh-col">FY23</div>
              <div className="mh-col">FY24</div>

              {/* row 1 */}
              <div className="mh-row-label">Revenue Quality</div>
              <div className="mh-cell mh-1">2.1</div>
              <div className="mh-cell mh-1">2.8</div>
              <div className="mh-cell mh-2">4.2</div>
              <div className="mh-cell mh-3">6.7</div>
              <div className="mh-cell mh-4">8.9</div>

              {/* row 2 */}
              <div className="mh-row-label">Cash Conversion</div>
              <div className="mh-cell mh-0">1.2</div>
              <div className="mh-cell mh-1">2.4</div>
              <div className="mh-cell mh-2">4.8</div>
              <div className="mh-cell mh-4">7.9</div>
              <div className="mh-cell mh-4">9.1</div>

              {/* row 3 */}
              <div className="mh-row-label">Receivables</div>
              <div className="mh-cell mh-0">1.0</div>
              <div className="mh-cell mh-0">1.5</div>
              <div className="mh-cell mh-1">3.1</div>
              <div className="mh-cell mh-2">5.4</div>
              <div className="mh-cell mh-3">7.2</div>

              {/* row 4 */}
              <div className="mh-row-label">Related Party</div>
              <div className="mh-cell mh-1">3.0</div>
              <div className="mh-cell mh-2">4.2</div>
              <div className="mh-cell mh-3">6.0</div>
              <div className="mh-cell mh-4">8.1</div>
              <div className="mh-cell mh-4">9.4</div>

              {/* row 5 */}
              <div className="mh-row-label">Leverage</div>
              <div className="mh-cell mh-1">2.3</div>
              <div className="mh-cell mh-2">4.0</div>
              <div className="mh-cell mh-2">4.5</div>
              <div className="mh-cell mh-3">6.1</div>
              <div className="mh-cell mh-3">6.8</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section reveal" id="how">
        <div className="section-tag">// Process</div>
        <h2 className="section-heading">How <em>AuditGPT</em> works</h2>
        <p className="section-sub">Four steps from raw financial data to actionable forensic intelligence — fully automated.</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-title">Data Ingestion</div>
            <div className="step-desc">NSE financial disclosures, annual reports, and BSE filings are automatically parsed and normalized across 5 fiscal years.</div>
            <span className="step-tag green">Automated</span>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-title">Quantitative Scoring</div>
            <div className="step-desc">Beneish M-Score, Altman Z-Score, and industry-adjusted models run simultaneously across 40+ financial ratios.</div>
            <span className="step-tag cyan">Multi-Model</span>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-title">Anomaly Detection</div>
            <div className="step-desc">Cross-dimensional heatmaps identify temporal patterns. Statistical outliers flagged at 2σ and 3σ thresholds. Related party networks mapped.</div>
            <span className="step-tag amber">AI-Powered</span>
          </div>
          <div className="step-card">
            <div className="step-num">04</div>
            <div className="step-title">LLM Narrative</div>
            <div className="step-desc">An LLM synthesizes all quantitative signals into plain-language forensic narrative — actionable for auditors, analysts, and regulators.</div>
            <span className="step-tag red">Gemini</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <div className="features-wrap" id="features">
        <div className="features-inner">
          <div className="section-tag reveal">// Capabilities</div>
          <h2 className="section-heading reveal">Every angle.<br /><em>No blind spots.</em></h2>
          <p className="section-sub reveal">AuditGPT combines six forensic disciplines into a single unified platform.</p>
          <div className="features-grid reveal">
            <div className="feature-card">
              <span className="feature-icon green">M</span>
              <div className="feature-title">Earnings Manipulation</div>
              <div className="feature-desc">Beneish M-Score decomposition with all 8 variables individually scored and charted over time.</div>
              <div className="feature-bullets">
                <div className="feature-bullet">Days Sales Outstanding ratio</div>
                <div className="feature-bullet">Gross Margin Index deterioration</div>
                <div className="feature-bullet">Total Accruals to Total Assets</div>
                <div className="feature-bullet">Sales Growth Index vs peers</div>
              </div>
            </div>
            <div className="feature-card red-accent">
              <span className="feature-icon red">⚡</span>
              <div className="feature-title">Cash Flow Forensics</div>
              <div className="feature-desc">Detects phantom income via CFO/Net Income divergence analysis — the oldest fraud signal in the book.</div>
              <div className="feature-bullets">
                <div className="feature-bullet">CFO to reported profit ratio tracking</div>
                <div className="feature-bullet">Working capital anomaly detection</div>
                <div className="feature-bullet">Capex to depreciation mismatch</div>
                <div className="feature-bullet">Free cash flow quality scoring</div>
              </div>
            </div>
            <div className="feature-card cyan-accent">
              <span className="feature-icon cyan">◈</span>
              <div className="feature-title">Related Party Mapping</div>
              <div className="feature-desc">Network graph of related party transactions. Unregistered entities flagged. Revenue concentration measured.</div>
              <div className="feature-bullets">
                <div className="feature-bullet">Director overlap detection</div>
                <div className="feature-bullet">Revenue concentration risk</div>
                <div className="feature-bullet">Circular transaction patterns</div>
                <div className="feature-bullet">Shell entity identification</div>
              </div>
            </div>
            <div className="feature-card amber-accent">
              <span className="feature-icon amber">Z</span>
              <div className="feature-title">Distress Analysis</div>
              <div className="feature-desc">Altman Z-Score with full working capital, retained earnings, EBIT and equity decomposition. Bankruptcy prediction.</div>
              <div className="feature-bullets">
                <div className="feature-bullet">Safe / grey / distress zone tracking</div>
                <div className="feature-bullet">Promoter pledge % over time</div>
                <div className="feature-bullet">Debt covenant proximity analysis</div>
                <div className="feature-bullet">Liquidity stress indicators</div>
              </div>
            </div>
            <div className="feature-card">
              <span className="feature-icon cyan">▲</span>
              <div className="feature-title">Case Comparable Matching</div>
              <div className="feature-desc">Pattern similarity engine matches current company trajectory against known fraud cases — Satyam, DHFL, IL&FS, Yes Bank.</div>
              <div className="feature-bullets">
                <div className="feature-bullet">Multi-dimensional similarity scoring</div>
                <div className="feature-bullet">Year-by-year trajectory replay</div>
                <div className="feature-bullet">Industry-normalized comparison</div>
              </div>
            </div>
            <div className="feature-card red-accent">
              <span className="feature-icon green">◎</span>
              <div className="feature-title">AI Forensic Narrative</div>
              <div className="feature-desc">LLM-generated analyst-grade narrative synthesizing all signals. Streaming output. Citation-linked to specific data points.</div>
              <div className="feature-bullets">
                <div className="feature-bullet">Plain-language fraud hypotheses</div>
                <div className="feature-bullet">Quantitative evidence mapping</div>
                <div className="feature-bullet">Regulatory referral recommendations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODELS ── */}
      <div className="models-section reveal" id="models">
        <div className="section-tag">// Detection Engine</div>
        <h2 className="section-heading" style={{ marginBottom: '12px' }}>Powered by <em>proven models</em></h2>
        <p className="section-sub">Every model backtested on Indian market fraud cases going back to 2001.</p>
        <div className="models-grid">
          <div className="model-card">
            <div className="model-name">Beneish</div>
            <div className="model-full">M-Score Earnings Manipulation Model (8-variable)</div>
            <div className="model-use">Primary Use</div>
            <div className="model-use-val">Earnings quality, accruals manipulation</div>
            <div className="model-divider"></div>
            <div className="model-accuracy">
              <div className="model-acc-val">76%</div>
              <div className="model-acc-label">Detection rate<br />on NSE corpus</div>
            </div>
          </div>
          <div className="model-card">
            <div className="model-name">Altman</div>
            <div className="model-full">Z-Score Financial Distress Predictor</div>
            <div className="model-use">Primary Use</div>
            <div className="model-use-val">Bankruptcy prediction, financial health</div>
            <div className="model-divider"></div>
            <div className="model-accuracy">
              <div className="model-acc-val">82%</div>
              <div className="model-acc-label">2-year prediction<br />accuracy</div>
            </div>
          </div>
          <div className="model-card">
            <div className="model-name">Industry Z</div>
            <div className="model-full">Sector-Adjusted Z-Score Anomaly Detection</div>
            <div className="model-use">Primary Use</div>
            <div className="model-use-val">Peer deviation, ratio outlier detection</div>
            <div className="model-divider"></div>
            <div className="model-accuracy">
              <div className="model-acc-val">71%</div>
              <div className="model-acc-label">Anomaly detection<br />accuracy</div>
            </div>
          </div>
          <div className="model-card">
            <div className="model-name">Gemini</div>
            <div className="model-full">LLM Forensic Narrative Synthesis</div>
            <div className="model-use">Primary Use</div>
            <div className="model-use-val">Pattern narrative, analyst-grade summary</div>
            <div className="model-divider"></div>
            <div className="model-accuracy">
              <div className="model-acc-val">92%</div>
              <div className="model-acc-label">Combined ensemble<br />accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── COMPARISON ── */}
      <div className="compare-section reveal">
        <div className="section-tag" style={{ marginBottom: '16px' }}>// Why AuditGPT</div>
        <h2 className="section-heading" style={{ marginBottom: '48px' }}>vs. existing <em>tools</em></h2>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Capability</th>
              <th className="highlight">AuditGPT</th>
              <th>Manual Audit</th>
              <th>Bloomberg Terminal</th>
              <th>Screener.in</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="feature-name">Multi-model fraud scoring</td>
              <td className="yes highlight-col">✓ Automated</td>
              <td className="no">✗ Manual</td>
              <td className="no">✗ Partial</td>
              <td className="no">✗ None</td>
            </tr>
            <tr>
              <td className="feature-name">Temporal anomaly heatmap</td>
              <td className="yes highlight-col">✓ 5-year view</td>
              <td className="no">✗</td>
              <td className="no">✗</td>
              <td className="no">✗</td>
            </tr>
            <tr>
              <td className="feature-name">Related party network mapping</td>
              <td className="yes highlight-col">✓ Automated</td>
              <td className="no">✗ Manual</td>
              <td className="no">✗</td>
              <td className="no">✗</td>
            </tr>
            <tr>
              <td className="feature-name">LLM forensic narrative</td>
              <td className="yes highlight-col">✓ Real-time</td>
              <td className="no">✗</td>
              <td className="no">✗</td>
              <td className="no">✗</td>
            </tr>
            <tr>
              <td className="feature-name">Historical fraud case comparables</td>
              <td className="yes highlight-col">✓ Satyam, DHFL, IL&FS</td>
              <td className="no">✗ Knowledge only</td>
              <td className="no">✗</td>
              <td className="no">✗</td>
            </tr>
            <tr>
              <td className="feature-name">NSE/BSE filing integration</td>
              <td className="yes highlight-col">✓ Live</td>
              <td className="no">✗ Manual</td>
              <td className="yes">✓ Paid API</td>
              <td className="yes">✓ Delayed</td>
            </tr>
            <tr>
              <td className="feature-name">Cost</td>
              <td className="yes highlight-col">Free / Open</td>
              <td className="no">₹15L+/year</td>
              <td className="no">$25K+/year</td>
              <td className="yes">₹2,400/year</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── TERMINAL ── */}
      <div className="terminal-section">
        <div className="terminal-inner">
          <div className="reveal">
            <div className="section-tag">// Under the Hood</div>
            <h2 className="section-heading" style={{ marginBottom: '16px' }}>Raw output,<br /><em>zero black box.</em></h2>
            <p style={{ fontSize: '17px', color: 'var(--text-2)', lineHeight: '1.7', maxWidth: '420px' }}>
              Every score is fully decomposed. Every flag is traced back to a specific financial line item. No mystery, no magic — just evidence.
            </p>
          </div>
          <div className="terminal-window reveal">
            <div className="terminal-bar">
              <div className="t-dot"></div><div className="t-dot"></div><div className="t-dot"></div>
              <div className="t-title">auditgpt — forensic engine v2.4</div>
            </div>
            <div className="terminal-body">
              <span className="t-line"><span className="t-prompt">$</span> <span className="t-cmd">auditgpt analyze --ticker INFRATECH --years 5</span></span>
              <span className="t-blank"></span>
              <span className="t-line t-out">► Loading NSE financial statements (FY2020–2024)...</span>
              <span className="t-line t-out">► Running Beneish 8-variable model...</span>
              <span className="t-line"><span className="t-key">  M-Score     </span><span className="t-val-red">−1.74</span><span className="t-out">  [threshold: −2.22] ⚠ ABOVE</span></span>
              <span className="t-line"><span className="t-key">  DSRI        </span><span className="t-val-red">1.89</span><span className="t-out">   [receivables inflation]</span></span>
              <span className="t-line"><span className="t-key">  TATA        </span><span className="t-val-red">0.073</span><span className="t-out">  [accrual anomaly]</span></span>
              <span className="t-blank"></span>
              <span className="t-line t-out">► Running Altman Z-Score...</span>
              <span className="t-line"><span className="t-key">  Z-Score     </span><span className="t-val-amber">1.23</span><span className="t-out">   [distress zone &lt;1.81]</span></span>
              <span className="t-blank"></span>
              <span className="t-line t-out">► Detecting related party anomalies...</span>
              <span className="t-line"><span className="t-key">  RPT/Revenue </span><span className="t-val-red">38.4%</span><span className="t-out">  [3 unregistered entities]</span></span>
              <span className="t-blank"></span>
              <span className="t-line t-out">► Matching case comparables...</span>
              <span className="t-line"><span className="t-key">  Satyam 2007 </span><span className="t-val-red">78%</span><span className="t-out">   match [CRITICAL]</span></span>
              <span className="t-blank"></span>
              <span className="t-line"><span className="t-key">  FRAUD SCORE </span><span className="t-val-red">82/100</span><span className="t-out"> ████████░░</span></span>
              <span className="t-line"><span className="t-prompt">$</span> <span className="t-cursor"></span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-tag">// Get Started</div>
        <h2 className="cta-heading">Find the fraud<br /><span className="accent">before it finds you.</span></h2>
        <p className="cta-sub">AuditGPT is open-source and built for the Indian market. Run your first forensic scan in under 60 seconds.</p>
        <div className="cta-actions">
          <span className="btn-primary" onClick={() => navigate('/radar')} style={{ cursor: 'pointer' }}>Launch AuditGPT →</span>
          <a href="https://github.com" className="btn-secondary">View on GitHub</a>
        </div>
        <div className="stamp-wrap">
          <div className="stamp">
            <div className="stamp-text">REFER<br />TO<br />SEBI</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="footer-brand">AuditGPT</div>
        <div className="footer-note">NSE Forensic Intelligence · FY2026 · Not financial advice</div>
        <div className="footer-links">
          <a href="#" className="footer-link">Docs</a>
          <a href="#" className="footer-link">GitHub</a>
          <a href="#" className="footer-link">API</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
      </footer>
    </>
  );
}