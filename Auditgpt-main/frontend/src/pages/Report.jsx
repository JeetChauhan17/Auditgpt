// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// const API = "http://localhost:8000/api";

// // ─── utils ──────────────────────────────────────────────────────────────────
// const riskOf = (score) => {
//   const s = Number(score) || 0;
//   if (s <= 25) return { label: "LOW",      hex: "#00ff88", glow: "#00ff8844", dim: "#00ff8820" };
//   if (s <= 50) return { label: "MEDIUM",   hex: "#ffb020", glow: "#ffb02044", dim: "#ffb02020" };
//   if (s <= 75) return { label: "HIGH",     hex: "#ff4455", glow: "#ff445544", dim: "#ff445520" };
//   return              { label: "CRITICAL", hex: "#ff4455", glow: "#ff445566", dim: "#ff445530" };
// };
// const riskFromLabel = (l = "") => {
//   const u = l.toUpperCase();
//   if (u === "LOW")    return riskOf(10);
//   if (u === "MEDIUM") return riskOf(40);
//   if (u === "HIGH")   return riskOf(65);
//   return riskOf(85);
// };
// const n2 = (v) => v == null ? "—" : Number(v).toFixed(2);
// const n1 = (v) => v == null ? "—" : Number(v).toFixed(1);
// const ni = (v) => v == null ? "—" : String(Math.round(Number(v)));
// const humanKey = (k = "") =>
//   k.replace(/_/g, " ").replace(/\bta\b/gi, "/ TA").replace(/\btl\b/gi, "/ TL").replace(/\bwc\b/gi, "WC").toUpperCase();

// const parseFlag = (f) => {
//   if (!f) return { year: null, severity: "MEDIUM", metric: null, desc: "Unknown flag" };
//   if (typeof f === "string") { try { f = JSON.parse(f); } catch { return { year: null, severity: "MEDIUM", metric: null, desc: f }; } }
//   const desc = f.industry_context || f.description || f.message || (f.evolution && Object.values(f.evolution)[0]) || f.citation || null;
//   return {
//     year: f.filing_year || f.year || null,
//     severity: (f.severity || "MEDIUM").toUpperCase(),
//     metric: (f.metric_name || f.metric || f.flag_type || "").replace(/_/g," ") || null,
//     value: f.reported_value != null ? String(f.reported_value) : null,
//     desc: desc || "See raw data for details",
//   };
// };

// function computeFallbackSentiment(financialData) {
//   const pl = financialData?.profit_loss || {};
//   const raw = pl["Net Profit+"] || pl["Net Profit"] || pl["Profit after tax"] || {};
//   const years = Object.keys(raw).filter(y => /^Mar \d{4}$/.test(y)).sort();
//   const result = {};
//   for (let i = 1; i < years.length; i++) {
//     const prev = raw[years[i-1]], curr = raw[years[i]];
//     if (prev != null && curr != null && prev !== 0)
//       result[years[i]] = Math.max(-1, Math.min(1, ((curr - prev) / Math.abs(prev)) * 1.5));
//   }
//   return result;
// }

// function renderInline(text) {
//   const parts = []; const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g; let last = 0, m;
//   while ((m = re.exec(text)) !== null) {
//     if (m.index > last) parts.push(text.slice(last, m.index));
//     if (m[2]) parts.push(<strong key={m.index} style={{color:"#e8f4ff",fontWeight:700}}>{m[2]}</strong>);
//     else if (m[3]) parts.push(<em key={m.index} style={{color:"#c8d8f0",fontStyle:"italic"}}>{m[3]}</em>);
//     else if (m[4]) parts.push(<code key={m.index} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.88em",color:"#00d4ff",background:"#00d4ff14",padding:"1px 6px",borderRadius:3}}>{m[4]}</code>);
//     last = m.index + m[0].length;
//   }
//   if (last < text.length) parts.push(text.slice(last));
//   return parts;
// }

// function MdText({ text, live }) {
//   if (!text) return null;
//   const lines = text.split("\n"); const els = []; let bulletBuf = [];
//   const flushBullets = (key) => {
//     if (!bulletBuf.length) return;
//     els.push(<ul key={`ul-${key}`} style={{margin:"6px 0 10px 0",paddingLeft:22,listStyle:"none"}}>
//       {bulletBuf.map((item, i) => (<li key={i} style={{marginBottom:5,display:"flex",gap:10,alignItems:"flex-start"}}>
//         <span style={{color:"#00ff88",fontFamily:"'JetBrains Mono',monospace",fontSize:14,lineHeight:1.7,flexShrink:0}}>›</span>
//         <span style={{color:"#c8d8f0",fontSize:15,lineHeight:1.7}}>{renderInline(item)}</span>
//       </li>))}</ul>);
//     bulletBuf = [];
//   };
//   lines.forEach((line, i) => {
//     const isLast = i === lines.length - 1;
//     if (/^#{1,2} /.test(line)) { flushBullets(i); els.push(<div key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,textTransform:"uppercase",letterSpacing:"0.18em",color:"#00ff88",marginTop:22,marginBottom:8,paddingBottom:6,borderBottom:"1px solid #1a2535"}}>{line.replace(/^#+\s/,"")}</div>); }
//     else if (/^[-*] /.test(line)) { bulletBuf.push(line.replace(/^[-*] /,"")); }
//     else if (line.trim() === "") { flushBullets(i); if (els.length) els.push(<div key={i} style={{height:8}}/>); }
//     else { flushBullets(i); els.push(<p key={i} style={{margin:"0 0 8px 0",color:"#c8d8f0",fontSize:15,lineHeight:1.85,fontFamily:"'Space Grotesk',sans-serif"}}>{renderInline(line)}{live&&isLast&&<span style={{display:"inline-block",width:10,height:17,background:"#00ff88",verticalAlign:"middle",marginLeft:3,animation:"blink .7s step-end infinite"}}/>}</p>); }
//   });
//   flushBullets("end");
//   return <div>{els}</div>;
// }

// const Scanlines = () => (<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 3px)"}}/>);

// function Nav({ sector }) {
//   const navigate = useNavigate();
//   const [t, setT] = useState(new Date());
//   useEffect(() => { const id = setInterval(()=>setT(new Date()),1000); return ()=>clearInterval(id); },[]);
//   return (
//     <header style={{position:"sticky",top:0,zIndex:100,height:46,display:"flex",alignItems:"center",padding:"0 40px",background:"#070b12f2",backdropFilter:"blur(20px)",borderBottom:"1px solid #0d1622"}}>
//       <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:10,marginRight:36}}>
//         <div style={{width:26,height:26,borderRadius:4,background:"linear-gradient(135deg,#00ff88,#00d4ff)",display:"grid",placeItems:"center"}}>
//           <span style={{fontSize:13,fontWeight:900,color:"#070b12",fontFamily:"'Space Grotesk',sans-serif"}}>A</span>
//         </div>
//         <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:"#d0dce8"}}>Audit<span style={{color:"#00ff88"}}>GPT</span></span>
//       </a>
//       <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>
//         <span onClick={()=>navigate("/radar")} style={{cursor:"pointer",color:"#4a6080",transition:"color .15s"}} onMouseEnter={e=>e.target.style.color="#8a9ab0"} onMouseLeave={e=>e.target.style.color="#4a6080"}>RADAR</span>
//         <span style={{color:"#1e2838"}}>›</span><span style={{color:"#5a7090"}}>{sector}</span>
//         <span style={{color:"#1e2838"}}>›</span><span style={{color:"#00ff88",letterSpacing:"0.08em"}}>FORENSIC REPORT</span>
//       </div>
//       <div style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:9,textAlign:"right",lineHeight:1.8}}>
//         <div style={{color:"#00ff88"}}>{t.toLocaleTimeString("en-IN",{hour12:false})} IST</div>
//         <div style={{color:"#2a3848"}}>{t.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div>
//       </div>
//     </header>
//   );
// }

// function Gauge({ score }) {
//   const risk = riskOf(score);
//   const R=82,CX=105,CY=105,C=2*Math.PI*R,ARC=C*0.78,filled=ARC*(Math.min(score,100)/100);
//   const ticks=[0,25,50,75,100].map(v=>{const a=((135+v*2.88)*Math.PI)/180;return{x1:CX+(R-20)*Math.cos(a),y1:CY+(R-20)*Math.sin(a),x2:CX+(R-7)*Math.cos(a),y2:CY+(R-7)*Math.sin(a)};});
//   return (<div style={{width:210,height:180,flexShrink:0}}><svg width="210" height="180" viewBox="0 0 210 180">
//     <defs><filter id="gGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
//     <circle cx={CX} cy={CY} r={R} fill="none" stroke="#0c1520" strokeWidth="14" strokeDasharray={`${ARC} ${C}`} transform={`rotate(135 ${CX} ${CY})`}/>
//     {["#00ff88","#00d4ff","#ffb020","#ff4455"].map((c,i)=>{const seg=ARC/4,sf=Math.max(0,Math.min(filled-i*seg,seg));if(!sf)return null;return<circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={c} strokeWidth="14" strokeDasharray={`${sf} ${C}`} strokeDashoffset={-i*seg} opacity="0.18" transform={`rotate(135 ${CX} ${CY})`}/>;})}
//     <circle cx={CX} cy={CY} r={R} fill="none" stroke={risk.hex} strokeWidth="5" strokeDasharray={`${filled} ${C}`} strokeLinecap="round" transform={`rotate(135 ${CX} ${CY})`} filter="url(#gGlow)" style={{transition:"stroke-dasharray 1.4s cubic-bezier(.23,1,.32,1)"}}/>
//     {ticks.map((tk,i)=><line key={i} {...tk} stroke="#1a2535" strokeWidth="2"/>)}
//     <text x={CX} y={CY-6} textAnchor="middle" fill={risk.hex} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:42,fontWeight:700,filter:`drop-shadow(0 0 18px ${risk.hex}99)`}}>{ni(score)}</text>
//     <text x={CX} y={CY+14} textAnchor="middle" fill="#3a4a60" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.08em"}}>/100</text>
//     <text x={CX} y={CY+34} textAnchor="middle" fill={risk.hex} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,letterSpacing:"0.22em",filter:`drop-shadow(0 0 10px ${risk.hex}77)`}}>{risk.label}</text>
//     <text x="22" y="174" fill="#2a3848" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8}}>0</text>
//     <text x="178" y="174" fill="#2a3848" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8}}>100</text>
//   </svg></div>);
// }

// function BdRow({ label, weight, value, color }) {
//   const pct=Math.min(Math.max(Number(value)||0,0),100);
//   return (<div style={{marginBottom:18}}>
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:7}}>
//       <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#7a8a9a",letterSpacing:"0.06em",fontWeight:600}}>{label}</span>
//       <div style={{display:"flex",alignItems:"center",gap:12}}>
//         <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#3a4860"}}>{weight}%</span>
//         <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:17,fontWeight:700,color,textShadow:`0 0 12px ${color}88`,minWidth:32,textAlign:"right"}}>{ni(value)}</span>
//       </div>
//     </div>
//     <div style={{height:4,background:"#0c1018",borderRadius:2,overflow:"hidden",position:"relative"}}>
//       <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${color}22,transparent)`}}/>
//       <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color}99,${color})`,borderRadius:2,boxShadow:`0 0 10px ${color}88`,transition:"width 1.2s cubic-bezier(.23,1,.32,1)"}}/>
//     </div>
//   </div>);
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // ─── SATYAM REPLAY CONTROLS ────────────────────────────────────────────────────
// // ═══════════════════════════════════════════════════════════════════════════════
// function ReplayControls({ maxYear, setMaxYear, allYears }) {
//   const [playing, setPlaying] = useState(false);
//   const [speed, setSpeed]     = useState(1000);
//   const intervalRef           = useRef(null);
//   const minY = allYears[0], maxY = allYears[allYears.length - 1];
//   const idx  = allYears.indexOf(maxYear);

//   const play = () => {
//     if (playing) { clearInterval(intervalRef.current); setPlaying(false); return; }
//     if (maxYear === maxY) setMaxYear(minY);
//     setPlaying(true);
//   };

//   useEffect(() => {
//     if (!playing) { clearInterval(intervalRef.current); return; }
//     intervalRef.current = setInterval(() => {
//       setMaxYear(prev => {
//         const i = allYears.indexOf(prev);
//         if (i >= allYears.length - 1) { setPlaying(false); return prev; }
//         return allYears[i + 1];
//       });
//     }, speed);
//     return () => clearInterval(intervalRef.current);
//   }, [playing, speed]);

//   const progress = allYears.length > 1 ? (Math.max(0,idx) / (allYears.length - 1)) * 100 : 100;

//   return (
//     <div style={{background:"#0a0e17",border:"1px solid #1a2535",borderTop:"2px solid #ff4455",borderRadius:4,padding:"16px 22px",marginBottom:14,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
//       <div>
//         <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#ff4455",letterSpacing:"0.2em",marginBottom:4,fontWeight:700}}>▶ SATYAM REPLAY MODE</div>
//         <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4a5a70",letterSpacing:"0.08em"}}>WATCHING FRAUD DEVELOP YEAR BY YEAR</div>
//       </div>
//       <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:36,fontWeight:700,color:"#ff4455",textShadow:"0 0 24px #ff445588",lineHeight:1,minWidth:80}}>
//         {maxYear ? maxYear.split(" ")[1] : "—"}
//       </div>
//       <button onClick={play} style={{all:"unset",cursor:"pointer",width:42,height:42,borderRadius:"50%",background:playing?"#ff445518":"#ff445514",border:`1px solid ${playing?"#ff4455":"#ff445555"}`,display:"grid",placeItems:"center",color:"#ff4455",fontSize:16,transition:"all .15s",flexShrink:0}}>
//         {playing ? "⏸" : "▶"}
//       </button>
//       <div style={{flex:1,minWidth:200}}>
//         <input type="range" min={0} max={allYears.length-1} value={Math.max(0,idx)}
//           onChange={e=>{setPlaying(false);setMaxYear(allYears[Number(e.target.value)]);}}
//           style={{width:"100%",accentColor:"#ff4455",cursor:"pointer"}}/>
//         <div style={{display:"flex",justifyContent:"space-between",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#3a4a60",marginTop:4}}>
//           <span>{allYears[0]?.split(" ")[1]}</span>
//           <span style={{color:"#ff4455",fontWeight:700}}>{progress.toFixed(0)}% revealed</span>
//           <span>{allYears[allYears.length-1]?.split(" ")[1]}</span>
//         </div>
//       </div>
//       <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
//         <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#3a4a60"}}>SPEED</span>
//         {[[2000,"0.5×"],[1000,"1×"],[500,"2×"]].map(([ms,lbl])=>(
//           <button key={ms} onClick={()=>setSpeed(ms)} style={{all:"unset",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,padding:"5px 12px",borderRadius:3,color:speed===ms?"#ff4455":"#3a4a60",background:speed===ms?"#ff445514":"transparent",border:`1px solid ${speed===ms?"#ff445544":"#1a2535"}`,transition:"all .1s"}}>{lbl}</button>
//         ))}
//       </div>
//       <button onClick={()=>{setPlaying(false);setMaxYear(maxY);}} style={{all:"unset",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:600,color:"#4a5a70",padding:"7px 14px",borderRadius:3,border:"1px solid #1a2535",transition:"all .15s",flexShrink:0}}>↺ RESET</button>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // ─── HEATMAP (replay-aware + fraud overlay) ───────────────────────────────────
// // ═══════════════════════════════════════════════════════════════════════════════
// function Heatmap({ anomalyMap, maxYear=null, satyamOverlay=null, showOverlay=false }) {
//   const [tip, setTip] = useState(null);
//   if (!anomalyMap||!Object.keys(anomalyMap).length) return <Empty msg="No anomaly data — run precompute.py"/>;

//   const metrics = Object.entries(anomalyMap);
//   const allYears = [...new Set(metrics.flatMap(([,y])=>Object.keys(y||{})))]
//     .filter(k=>/^Mar \d{4}$/.test(k))
//     .sort((a,b)=>parseInt(a.split(" ")[1])-parseInt(b.split(" ")[1]));
//   if (!allYears.length) return <Empty msg="Z-score years not in expected format"/>;

//   const visibleYears = maxYear
//     ? allYears.filter(y=>parseInt(y.split(" ")[1])<=parseInt(maxYear.split(" ")[1]))
//     : allYears;

//   const cellBg=(z)=>{if(z==null)return"#0a0e16";const a=Math.abs(z);if(a<0.5)return"#0c1018";if(a<1.0)return z>0?"#1e1408":"#081410";if(a<1.5)return z>0?"#2d1c08":"#081c14";if(a<2.0)return z>0?"#3e2208":"#082418";if(a<2.5)return z>0?"#582a0a":"#0a2e20";return z>0?"#7c1820":"#0a3c30";};
//   const cellFg=(z)=>{if(z==null)return"#2a3850";const a=Math.abs(z);if(a<0.5)return"#3a4a66";if(a<1.5)return z>0?"#e09040":"#40b888";if(a<2.5)return z>0?"#ff9945":"#00cc90";return z>0?"#ff4455":"#00d4ff";};
//   const tipAccent=(z)=>z==null||Math.abs(z)<1.5?"#3a4a60":z>0?"#ff4455":"#00d4ff";
//   const sevLabel=(z)=>{if(z==null)return"NO DATA";const a=Math.abs(z);if(a<0.5)return"NORMAL";if(a<1.5)return"MILD DEVIATION";if(a<2.5)return"SIGNIFICANT ANOMALY";return"EXTREME ANOMALY";};
//   const short=(s)=>s.replace("Interest Coverage Ratio","ICR").replace("Inventory Turnover","Inv TO").replace("Asset Turnover","Asset TO").replace("Dividend Payout","Div Pay").replace("Earnings Per Share","EPS").replace("Current Ratio","Cur Ratio").replace("Debt to equity","D/E");

//   const CW=46,LW=100;

//   return (
//     <div style={{position:"relative"}}>
//       {tip&&(<div style={{position:"fixed",left:tip.x+18,top:tip.y-14,zIndex:10000,background:"#0d1422",border:`1px solid ${tipAccent(tip.z)}55`,borderLeft:`3px solid ${tipAccent(tip.z)}`,borderRadius:5,padding:"14px 18px",pointerEvents:"none",minWidth:210,boxShadow:"0 10px 40px rgba(0,0,0,0.7)"}}>
//         <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#5a6a80",letterSpacing:"0.1em",marginBottom:7}}>{tip.year}</div>
//         <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:"#d0dce8",marginBottom:12}}>{tip.metric}</div>
//         <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:8}}>
//           <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:30,fontWeight:700,color:cellFg(tip.z),textShadow:`0 0 16px ${cellFg(tip.z)}99`,lineHeight:1}}>{tip.z!=null?n1(tip.z):"—"}</span>
//           <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:"#5a6a80"}}>σ</span>
//         </div>
//         <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4a5a70",letterSpacing:"0.08em"}}>{sevLabel(tip.z)}</div>
//       </div>)}

//       <div style={{overflowX:"auto"}}>
//         <div style={{minWidth:LW+visibleYears.length*(CW+2)+20}}>
//           <div style={{display:"flex",paddingLeft:LW+2,marginBottom:8}}>
//             {visibleYears.map(y=>(<div key={y} style={{width:CW,marginRight:2,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#6a7a90",letterSpacing:"0.04em",fontWeight:600}}>{y.split(" ")[1]}</div>))}
//           </div>

//           {metrics.map(([metric,yearData])=>(
//             <div key={metric} style={{display:"flex",alignItems:"center",marginBottom:3}}>
//               <div style={{width:LW,paddingRight:10,textAlign:"right",flexShrink:0,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#6a7a90",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{short(metric)}</div>
//               {visibleYears.map(yr=>{
//                 const z=yearData?.[yr],big=z!=null&&Math.abs(z)>=2;
//                 return (<div key={yr} style={{width:CW,height:32,marginRight:2,borderRadius:3,flexShrink:0,background:cellBg(z),border:`1px solid ${big?(z>0?"#ff445544":"#00d4ff44"):"#0c1520"}`,display:"grid",placeItems:"center",cursor:"crosshair",boxShadow:big?(z>0?"0 0 8px #ff445540":"0 0 8px #00d4ff40"):"none",transition:"background 0.3s ease,transform .1s",position:"relative",zIndex:1}}
//                   onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.18)";e.currentTarget.style.zIndex="20";setTip({x:e.clientX,y:e.clientY,metric,year:yr,z});}}
//                   onMouseMove={e=>setTip(t=>t?{...t,x:e.clientX,y:e.clientY}:t)}
//                   onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.zIndex="1";setTip(null);}}>
//                   <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:big?700:500,color:cellFg(z)}}>{z!=null?n1(z):"·"}</span>
//                 </div>);
//               })}
//             </div>
//           ))}

//           {/* ── SATYAM GHOST OVERLAY ── */}
//           {showOverlay && satyamOverlay && (()=>{
//             const overlayMetrics=["DSRI","SGI","TATA"];
//             const matchYears=visibleYears.filter(y=>satyamOverlay[y]);
//             if(!matchYears.length) return null;
//             return (<>
//               <div style={{marginTop:14,marginBottom:10,paddingLeft:LW+2,display:"flex",alignItems:"center",gap:10}}>
//                 <div style={{flex:1,height:1,background:"linear-gradient(90deg,#ff445544,transparent)"}}/>
//                 <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#ff4455",letterSpacing:"0.14em",fontWeight:700,whiteSpace:"nowrap",padding:"3px 10px",background:"#ff445512",border:"1px solid #ff445533",borderRadius:3}}>
//                   ◈ PATTERN SIMILARITY: SATYAM COMPUTER SERVICES (2004–2008)
//                 </span>
//                 <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,#ff445544)"}}/>
//               </div>
//               {overlayMetrics.map(metric=>(
//                 <div key={`satyam-${metric}`} style={{display:"flex",alignItems:"center",marginBottom:3}}>
//                   <div style={{width:LW,paddingRight:10,textAlign:"right",flexShrink:0,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#ff4455",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"0.04em"}}>⋯ {metric}</div>
//                   {visibleYears.map(yr=>{
//                     const z=satyamOverlay?.[yr]?.[metric]??null,big=z!=null&&Math.abs(z)>=2;
//                     return (<div key={yr} style={{width:CW,height:28,marginRight:2,borderRadius:3,flexShrink:0,background:z!=null?"#ff445510":"transparent",border:`1px dashed ${z!=null?"#ff445566":"#1a2535"}`,display:"grid",placeItems:"center",boxShadow:big?"0 0 6px #ff445530":"none",transition:"background 0.3s ease"}}>
//                       <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,fontWeight:700,color:z!=null?"#ff4455":"#1a2535",opacity:0.85}}>{z!=null?n1(z):"·"}</span>
//                     </div>);
//                   })}
//                 </div>
//               ))}
//             </>);
//           })()}

//           <div style={{display:"flex",gap:20,marginTop:18,paddingLeft:LW+2,flexWrap:"wrap"}}>
//             {[["#0c1018","#3a4a66","< 0.5σ normal"],["#2d1c08","#e09040","0.5–2σ elevated"],["#7c1820","#ff4455","> 2σ extreme high"],["#081c14","#40b888","0.5–2σ low"],["#0a3c30","#00d4ff","> 2σ extreme low"]].map(([bg,fg,lbl])=>(
//               <div key={lbl} style={{display:"flex",alignItems:"center",gap:7}}>
//                 <div style={{width:14,height:14,borderRadius:2,background:bg,border:`1px solid ${fg}55`}}/>
//                 <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#5a6a80",fontWeight:600}}>{lbl}</span>
//               </div>
//             ))}
//             {showOverlay&&<div style={{display:"flex",alignItems:"center",gap:7}}>
//               <div style={{width:14,height:14,borderRadius:2,background:"#ff445510",border:"1px dashed #ff445566"}}/>
//               <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#ff4455",fontWeight:700}}>Satyam ghost</span>
//             </div>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Timeline({ flags, maxYear=null }) {
//   const visible = maxYear
//     ? flags.filter(f=>{const p=parseFlag(f);return !p.year||p.year<=parseInt(maxYear.split(" ")[1]);})
//     : flags;
//   if (!visible?.length) return (<div style={{display:"flex",alignItems:"center",gap:12,padding:"24px 0"}}>
//     <div style={{width:10,height:10,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 12px #00ff88"}}/>
//     <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#00ff8899",letterSpacing:"0.1em"}}>NO RED FLAGS DETECTED</span>
//   </div>);
//   const sevCol=(s="")=>{const u=s.toUpperCase();if(u==="CRITICAL"||u==="HIGH")return"#ff4455";if(u==="MEDIUM")return"#ffb020";return"#00ff88";};
//   return (<div style={{position:"relative",paddingLeft:30}}>
//     <div style={{position:"absolute",left:9,top:18,bottom:18,width:1,background:"linear-gradient(180deg,#2a3848 60%,transparent)"}}/>
//     {visible.map((rawF,i)=>{const f=parseFlag(rawF),col=sevCol(f.severity);return(
//       <div key={i} style={{position:"relative",paddingBottom:26}}>
//         <div style={{position:"absolute",left:-24,top:4,width:14,height:14,borderRadius:"50%",background:`${col}18`,border:`2px solid ${col}`,boxShadow:`0 0 14px ${col}aa`,zIndex:1}}/>
//         <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
//           {f.year&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#9aaabb",background:"#0d1422",padding:"4px 11px",borderRadius:3,border:"1px solid #1e2a3a",letterSpacing:"0.04em",fontWeight:600}}>{f.year}</span>}
//           <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:col,background:`${col}16`,border:`1px solid ${col}55`,padding:"4px 11px",borderRadius:3,letterSpacing:"0.14em"}}>{f.severity}</span>
//           {f.metric&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#8a9aaa",background:"#0a0e17",padding:"4px 11px",borderRadius:3,border:"1px solid #1a2535",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>{f.metric}</span>}
//         </div>
//         <p style={{margin:0,fontFamily:"'Space Grotesk',sans-serif",fontSize:13,color:"#a8b8cc",lineHeight:1.75,maxWidth:520,fontWeight:500}}>{f.desc}</p>
//       </div>);
//     })}
//   </div>);
// }

// function PeerChart({ name, score, peers=[] }) {
//   const safePeers=(peers||[]).filter(p=>p&&(p.company_name||p.name||p.company_id));
//   const all=[{company_name:name,composite_score:score,isSelf:true},...safePeers].sort((a,b)=>(b.composite_score??0)-(a.composite_score??0));
//   if(all.length<=1)return<Empty msg="No peer data. Ensure precompute.py generated sector data."/>;
//   const peak=Math.max(...all.map(c=>c.composite_score??0),1);
//   const half=Math.ceil(all.length/2);
//   const cols=[all.slice(0,half),all.slice(half)];
//   return (<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
//     {cols.map((col,ci)=>(<div key={ci} style={{display:"flex",flexDirection:"column",gap:7}}>
//       {col.map((c,i)=>{const r=riskOf(c.composite_score??0),pct=((c.composite_score??0)/peak)*100,nm=c.company_name||c.name||c.company_id||"Unknown";return(
//         <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 140px 52px",alignItems:"center",gap:12,padding:"12px 16px",background:c.isSelf?"#0d1422":"#080c14",border:c.isSelf?`1px solid ${r.glow}`:"1px solid #0d1622",borderRadius:4,position:"relative",overflow:"hidden"}}>
//           {c.isSelf&&<div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,${r.hex}09 0%,transparent 50%)`,pointerEvents:"none"}}/>}
//           <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:c.isSelf?700:500,color:c.isSelf?"#e0eaf8":"#7a8a98",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:9}}>
//             <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{nm}</span>
//             {c.isSelf&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,flexShrink:0,color:r.hex,background:`${r.hex}18`,padding:"2px 7px",borderRadius:2,letterSpacing:"0.1em"}}>◀ THIS</span>}
//           </div>
//           <div style={{height:4,background:"#0a0e16",borderRadius:2,overflow:"hidden"}}>
//             <div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:`linear-gradient(90deg,${r.hex}77,${r.hex})`,boxShadow:c.isSelf?`0 0 10px ${r.hex}66`:"none",transition:"width 1s cubic-bezier(.23,1,.32,1)"}}/>
//           </div>
//           <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:17,fontWeight:700,color:r.hex,textAlign:"right",textShadow:c.isSelf?`0 0 14px ${r.hex}88`:"none"}}>{ni(c.composite_score)}</div>
//         </div>);
//       })}
//     </div>))}
//   </div>);
// }

// function Sentiment({ data, financialData }) {
//   const resolved=(data&&Object.keys(data).length>0)?data:computeFallbackSentiment(financialData);
//   const isFallback=!(data&&Object.keys(data).length>0);
//   if(!Object.keys(resolved).length)return<Empty msg="No financial data available"/>;
//   const years=Object.keys(resolved).filter(y=>/^Mar \d{4}$/.test(y)).sort();
//   const vals=years.map(y=>{const v=resolved[y];return typeof v==="object"?(v.compound??0):Number(v)||0;});
//   const peak=Math.max(...vals.map(Math.abs),0.01);
//   return (<div>
//     {isFallback&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4a6080",letterSpacing:"0.1em",marginBottom:14,padding:"6px 12px",background:"#0a0e17",border:"1px solid #1a2535",borderRadius:3}}>⚠ PROXY MODE — net profit YoY</div>}
//     <div style={{display:"flex",alignItems:"stretch",height:120,gap:4,position:"relative"}}>
//       <div style={{position:"absolute",left:0,right:0,top:"50%",height:1,background:"#1e2a3a"}}/>
//       {years.map((y,i)=>{const v=vals[i],isPos=v>=0,pct=Math.max((Math.abs(v)/peak)*46,3),col=isPos?"#00ff88":"#ff4455";return(
//         <div key={y} title={`${y}: ${v.toFixed(3)}`} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"default"}}>
//           {isPos?<div style={{width:"70%",height:`${pct}%`,minHeight:3,background:col,borderRadius:"2px 2px 0 0",boxShadow:`0 0 10px ${col}66`,alignSelf:"flex-end",marginBottom:"50%"}}/>
//                 :<div style={{width:"70%",height:`${pct}%`,minHeight:3,background:col,borderRadius:"0 0 2px 2px",boxShadow:`0 0 10px ${col}66`,alignSelf:"flex-start",marginTop:"50%"}}/>}
//         </div>);
//       })}
//     </div>
//     <div style={{display:"flex",marginTop:6,gap:4}}>
//       {years.map(y=>(<div key={y} style={{flex:1,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4a5a72",fontWeight:600}}>'{y.replace("Mar ","").slice(2)}</div>))}
//     </div>
//     <div style={{display:"flex",gap:20,marginTop:14}}>
//       {[["#00ff88","Positive"],["#ff4455","Negative"]].map(([c,l])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:7}}>
//         <div style={{width:10,height:10,borderRadius:2,background:c,boxShadow:`0 0 6px ${c}88`}}/>
//         <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#6a7a8a",fontWeight:600}}>{l}</span>
//       </div>))}
//     </div>
//   </div>);
// }

// function Narrative({ companyId, preloaded }) {
//   const [text,setText]=useState(preloaded||"");
//   const [live,setLive]=useState(false);
//   const [done,setDone]=useState(!!preloaded);
//   const boxRef=useRef(null);
//   const run=()=>{
//     if(live)return;
//     setText("");setDone(false);setLive(true);
//     const es=new EventSource(`${API}/stream/${companyId}`);
//     es.onmessage=(e)=>{
//       if(e.data==="[DONE]"){es.close();setLive(false);setDone(true);return;}
//       let chunk=e.data;try{chunk=JSON.parse(e.data);}catch{}
//       setText(p=>p+chunk);
//       if(boxRef.current)boxRef.current.scrollTop=boxRef.current.scrollHeight;
//     };
//     es.onerror=()=>{es.close();setLive(false);setDone(true);};
//   };
//   return (<div>
//     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
//       <div style={{display:"flex",gap:9,alignItems:"center"}}>
//         {live&&<div style={{width:8,height:8,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 12px #00ff88",animation:"pulseGreen 1s ease-in-out infinite"}}/>}
//         <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",fontWeight:600,color:live?"#00ff88":done?"#4a6080":"#2a3850"}}>{live?"STREAMING…":done?"COMPLETE":"READY"}</span>
//       </div>
//       <button onClick={run} disabled={live} style={{all:"unset",cursor:live?"not-allowed":"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.1em",fontWeight:700,color:live?"#2a3850":"#00ff88",background:live?"#0a0e17":"#00ff8814",border:`1px solid ${live?"#1a2535":"#00ff8855"}`,padding:"8px 20px",borderRadius:3,transition:"all .15s"}}>
//         {done?"↺ REGENERATE":"▶ GENERATE"}
//       </button>
//     </div>
//     <div ref={boxRef} style={{background:"#050810",border:"1px solid #0e1824",borderRadius:4,padding:"22px 26px",minHeight:180,maxHeight:480,overflowY:"auto"}}>
//       {text?<MdText text={text} live={live}/>
//             :<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#2a3850",letterSpacing:"0.04em",lineHeight:2}}>Click GENERATE to run Gemini forensic narrative analysis…</div>}
//     </div>
//   </div>);
// }

// function KV({ label, value }) {
//   return (<div style={{padding:"11px 0",borderBottom:"1px solid #0f1826",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
//     <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#7a8a9a",letterSpacing:"0.04em",flexShrink:0,fontWeight:600}}>{humanKey(label)}</span>
//     <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:"#a0b4cc"}}>{value}</span>
//   </div>);
// }

// function Pane({ tag, title, accent="#1a2535", children, style:sx={} }) {
//   return (<div style={{background:"#080c14",border:"1px solid #0f1826",borderTop:`2px solid ${accent}`,borderRadius:4,padding:"24px 26px 22px",position:"relative",overflow:"hidden",...sx}}>
//     <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${accent}10,transparent 70%)`,pointerEvents:"none"}}/>
//     <div style={{marginBottom:18}}>
//       {tag&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4a6080",letterSpacing:"0.2em",marginBottom:6,fontWeight:600}}>{tag}</div>}
//       <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:700,color:"#d8e8f8",letterSpacing:"-0.01em"}}>{title}</div>
//     </div>
//     {children}
//   </div>);
// }

// function Empty({ msg }) { return <div style={{padding:"18px 0",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3a4a60",letterSpacing:"0.04em",fontWeight:600}}>{msg}</div>; }

// function StatChip({ label, value, color="#4a6080", sub, onClick, active }) {
//   return (<div onClick={onClick} style={{background:"#070b12",border:`1px solid ${active?color:"#0f1826"}`,borderRadius:3,padding:"12px 18px",cursor:onClick?"pointer":"default",transition:"border-color .2s"}}>
//     <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#3a5070",letterSpacing:"0.14em",marginBottom:5,fontWeight:600}}>{label}</div>
//     <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color,textShadow:`0 0 14px ${color}66`,lineHeight:1}}>{value}</div>
//     {sub&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color,letterSpacing:"0.1em",opacity:0.8,marginTop:4,fontWeight:600}}>{sub}</div>}
//   </div>);
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// export default function Report() {
//   const { companyId } = useParams();
//   const [report,setReport]       = useState(null);
//   const [loading,setLoading]     = useState(true);
//   const [err,setErr]             = useState(null);
//   const [replayMode,setReplayMode] = useState(false);
//   const [maxYear,setMaxYear]       = useState(null);
//   const [showOverlay,setShowOverlay] = useState(false);
//   const [satyamData,setSatyamData]   = useState(null);

//   useEffect(()=>{
//     setLoading(true);setErr(null);setReport(null);
//     fetch(`${API}/report/${companyId}`)
//       .then(r=>{if(!r.ok)throw new Error(r.status);return r.json();})
//       .then(d=>{setReport(d);setLoading(false);})
//       .catch(e=>{setErr(e.message);setLoading(false);});
//   },[companyId]);

//   useEffect(()=>{
//     if(!report||report.composite_score<=50)return;
//     fetch("/fraud_signatures/satyam.json").then(r=>r.ok?r.json():null).then(d=>{if(d)setSatyamData(d);}).catch(()=>{});
//   },[report]);

//   if(loading)return(<div style={{minHeight:"100vh",background:"#070b12",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22}}>
//     <div style={{position:"relative",width:52,height:52}}>
//       <div style={{width:52,height:52,border:"1px solid #0f1826",borderTop:"2px solid #00ff88",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
//       <div style={{position:"absolute",inset:9,border:"1px solid #0f1826",borderBottom:"2px solid #00d4ff",borderRadius:"50%",animation:"spin 1.2s linear infinite reverse"}}/>
//     </div>
//     <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#3a5070",letterSpacing:"0.22em",fontWeight:600}}>LOADING FORENSIC REPORT</div>
//     <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//   </div>);

//   if(err||!report)return(<div style={{minHeight:"100vh",background:"#070b12",display:"flex",alignItems:"center",justifyContent:"center"}}>
//     <div style={{background:"#0d0810",border:"1px solid #ff445530",borderLeft:"3px solid #ff4455",borderRadius:4,padding:"22px 30px",fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#ff7788",fontWeight:600}}>⚠ {err||"Unknown error"} — could not load {companyId}</div>
//   </div>);

//   const risk    = riskFromLabel(report.risk_level);
//   const bd      = report.breakdown||{};
//   const ben     = report.beneish||{};
//   const alt     = report.altman||{};
//   const flags   = report.red_flags||[];
//   const isCritical = report.composite_score>50;

//   const benZone = ben.manipulation_likely?{label:"MANIPULATION LIKELY",verdict:"⚠ RISKY",color:"#ff4455"}:{label:"BELOW THRESHOLD",verdict:"✓ CLEAN",color:"#00ff88"};
//   const altZone = (()=>{const z=(alt.zone||"").toLowerCase();if(z==="safe")return{label:"SAFE ZONE",color:"#00ff88"};if(z==="distress")return{label:"DISTRESS ZONE",color:"#ff4455"};return{label:"GREY ZONE",color:"#ffb020"};})();
//   const mcap=report.market_cap?(report.market_cap>100000?`₹${(report.market_cap/100000).toFixed(1)}L Cr`:`₹${Math.round(report.market_cap).toLocaleString()} Cr`):null;

//   const anomalyYears=report.anomaly_map
//     ?[...new Set(Object.values(report.anomaly_map).flatMap(y=>Object.keys(y||{})))].filter(k=>/^Mar \d{4}$/.test(k)).sort((a,b)=>parseInt(a.split(" ")[1])-parseInt(b.split(" ")[1]))
//     :[];

//   const effectiveMaxYear=replayMode?maxYear:null;

//   return (<div style={{minHeight:"100vh",background:"#070b12",color:"#c8d8e8"}}>
//     <Scanlines/>
//     <Nav sector={report.sector||"—"}/>
//     <div style={{height:2,background:`linear-gradient(90deg,${risk.hex} 0%,${risk.hex}55 40%,transparent 70%)`}}/>

//     <div style={{padding:"28px 40px 100px"}}>

//       {/* HERO */}
//       <div style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:36,alignItems:"start",background:"linear-gradient(135deg,#0a0e17 0%,#080c14 100%)",border:"1px solid #0f1826",borderTop:`2px solid ${risk.hex}`,borderRadius:4,padding:"32px 36px",marginBottom:14,position:"relative",overflow:"hidden"}}>
//         <div style={{position:"absolute",top:-50,right:60,width:360,height:360,borderRadius:"50%",background:`radial-gradient(circle,${risk.hex}07 0%,transparent 70%)`,pointerEvents:"none"}}/>
//         <Gauge score={report.composite_score}/>
//         <div style={{paddingTop:6}}>
//           <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#3a5070",letterSpacing:"0.22em",marginBottom:10,fontWeight:600}}>NSE · {(report.sector||"").toUpperCase()} · FORENSIC ANALYSIS</div>
//           <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:30,fontWeight:800,color:"#e8f4ff",margin:"0 0 5px",lineHeight:1.08,letterSpacing:"-0.02em"}}>{report.company_name}</h1>
//           <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#3a5070",marginBottom:22,letterSpacing:"0.1em",fontWeight:600}}>{report.company_id}</div>
//           <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
//             {mcap&&<StatChip label="MARKET CAP" value={mcap} color="#00d4ff"/>}
//             {report.sector&&<StatChip label="SECTOR" value={report.sector} color="#a855f7"/>}
//             <StatChip label="FLAGS DETECTED" value={flags.length} color={flags.length>2?"#ff4455":flags.length>0?"#ffb020":"#00ff88"} sub={flags.length>0?"REVIEW REQUIRED":"CLEAN"}/>
//             {/* replay toggle */}
//             <StatChip label="SATYAM REPLAY" value={replayMode?"◉ ON":"◎ OFF"} color={replayMode?"#ff4455":"#4a6080"} active={replayMode} onClick={()=>{setReplayMode(r=>{if(!r&&anomalyYears.length)setMaxYear(anomalyYears[0]);return!r;});}}/>
//             {/* overlay toggle — only when score > 50 and satyam data loaded */}
//             {isCritical&&satyamData&&<StatChip label="FRAUD OVERLAY" value={showOverlay?"◉ ON":"◎ OFF"} color={showOverlay?"#ff4455":"#4a6080"} active={showOverlay} onClick={()=>setShowOverlay(o=>!o)}/>}
//           </div>
//           {report.risk_reasoning&&<div style={{background:`${risk.hex}07`,border:`1px solid ${risk.hex}22`,borderLeft:`3px solid ${risk.hex}`,borderRadius:3,padding:"12px 18px",fontFamily:"'Space Grotesk',sans-serif",fontSize:14,color:"#8a9ab8",lineHeight:1.75,maxWidth:640,fontWeight:500}}>{report.risk_reasoning}</div>}
//         </div>
//         <div style={{minWidth:260,paddingTop:6}}>
//           <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#2e4060",letterSpacing:"0.22em",marginBottom:18,fontWeight:600}}>SCORE BREAKDOWN</div>
//           <BdRow label="BENEISH M-SCORE"  weight={35} value={bd.beneish_normalized}    color="#00d4ff"/>
//           <BdRow label="ALTMAN Z-SCORE"   weight={30} value={bd.altman_normalized}     color="#ffb020"/>
//           <BdRow label="INDUSTRY Z-SCORE" weight={25} value={bd.industry_z_normalized} color="#a855f7"/>
//           <BdRow label="TREND BREAKS"     weight={10} value={bd.trend_break_normalized} color="#ff4455"/>
//           <div style={{marginTop:18,paddingTop:16,borderTop:"1px solid #0f1826",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
//             <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3a5070",letterSpacing:"0.12em",fontWeight:600}}>COMPOSITE</span>
//             <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:30,fontWeight:700,color:risk.hex,textShadow:`0 0 18px ${risk.hex}77`}}>{ni(report.composite_score)}</span>
//           </div>
//         </div>
//       </div>

//       {/* REPLAY CONTROLS */}
//       {replayMode&&anomalyYears.length>0&&(
//         <ReplayControls maxYear={maxYear||anomalyYears[anomalyYears.length-1]} setMaxYear={setMaxYear} allYears={anomalyYears}/>
//       )}

//       {/* HEATMAP + TIMELINE */}
//       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
//         <Pane tag="INDUSTRY-ADJUSTED Z-SCORES · 10-YEAR VIEW" title="Anomaly Heatmap" accent="#00d4ff">
//           <Heatmap anomalyMap={report.anomaly_map} maxYear={effectiveMaxYear} satyamOverlay={satyamData} showOverlay={showOverlay}/>
//         </Pane>
//         <Pane tag={`${flags.length} FLAG${flags.length!==1?"S":""} DETECTED`} title="Red Flag Timeline" accent="#ff4455">
//           <Timeline flags={flags} maxYear={effectiveMaxYear}/>
//         </Pane>
//       </div>

//       {/* PEERS FULL WIDTH */}
//       <Pane tag={`${report.sector||""} · SECTOR BENCHMARK`} title="Peer Comparison" accent="#a855f7" style={{marginBottom:14}}>
//         <PeerChart name={report.company_name} score={report.composite_score} peers={report.peer_companies}/>
//       </Pane>

//       {/* BENEISH + ALTMAN */}
//       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
//         <Pane tag="EARNINGS MANIPULATION · BENEISH (1999)" title="M-Score Analysis" accent="#00d4ff">
//           <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
//             <div>
//               <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:44,fontWeight:700,color:benZone.color,lineHeight:1,textShadow:`0 0 22px ${benZone.color}77`}}>{n2(ben.m_score)}</div>
//               <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:benZone.color,marginTop:8,letterSpacing:"0.14em",fontWeight:700}}>{benZone.label}</div>
//               <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#4a6080",marginTop:4,fontWeight:600}}>threshold: −1.78</div>
//             </div>
//             <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:benZone.color,background:`${benZone.color}14`,border:`1px solid ${benZone.color}55`,padding:"7px 16px",borderRadius:3,letterSpacing:"0.1em"}}>{benZone.verdict}</div>
//           </div>
//           {ben.components&&Object.entries(ben.components).map(([k,v])=><KV key={k} label={k} value={n2(v)}/>)}
//         </Pane>
//         <Pane tag="BANKRUPTCY PREDICTION · ALTMAN (1968)" title="Z-Score Analysis" accent="#ffb020">
//           <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
//             <div>
//               <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:44,fontWeight:700,color:altZone.color,lineHeight:1,textShadow:`0 0 22px ${altZone.color}77`}}>{n2(alt.z_score)}</div>
//               <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:altZone.color,marginTop:8,letterSpacing:"0.14em",fontWeight:700}}>{altZone.label}</div>
//               <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#4a6080",marginTop:4,fontWeight:600}}>safe &gt; 2.99 · distress &lt; 1.81</div>
//             </div>
//             <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:altZone.color,background:`${altZone.color}14`,border:`1px solid ${altZone.color}55`,padding:"7px 16px",borderRadius:3,letterSpacing:"0.1em"}}>{(alt.zone||"—").toUpperCase()}</div>
//           </div>
//           {alt.components&&Object.entries(alt.components).map(([k,v])=><KV key={k} label={k} value={n2(v)}/>)}
//         </Pane>
//       </div>

//       {/* SENTIMENT + NARRATIVE */}
//       <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:14}}>
//         <Pane tag="VADER SENTIMENT · PROFIT TREND PROXY" title="Sentiment Trend" accent="#00d4ff">
//           <Sentiment data={report.sentiment_trend} financialData={report.financial_data}/>
//         </Pane>
//         <Pane tag="GEMINI 2.0 FLASH · LLM FORENSIC ANALYSIS" title="Narrative" accent="#00ff88">
//           <Narrative companyId={companyId} preloaded={report.narrative}/>
//         </Pane>
//       </div>

//     </div>

//     <style>{`
//       @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
//       *{box-sizing:border-box}body{margin:0;background:#070b12;-webkit-font-smoothing:antialiased}
//       ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#060a10}
//       ::-webkit-scrollbar-thumb{background:#1a2535;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#253040}
//       input[type=range]{height:4px;background:#1a2535;border-radius:2px;outline:none;border:none}
//       input[type=range]::-webkit-slider-thumb{width:16px;height:16px;border-radius:50%;cursor:pointer}
//       @keyframes spin{to{transform:rotate(360deg)}}@keyframes pulseGreen{0%,100%{opacity:1}50%{opacity:.2}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
//     `}</style>
//   </div>);
// }
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import SatyamReplaySection from "../components/SatyamReplaySection"
import Navbar from "../components/Navbar";
// const API = "http://localhost:8000/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
// ─── utils ──────────────────────────────────────────────────────────────────
const riskOf = (s) => {
  const v = Number(s) || 0;
  if (v <= 25) return { label: "LOW",      hex: "#00ff88", dim: "#00ff8830", glow: "#00ff8855" };
  if (v <= 50) return { label: "MEDIUM",   hex: "#ffb020", dim: "#ffb02030", glow: "#ffb02055" };
  if (v <= 75) return { label: "HIGH",     hex: "#ff4455", dim: "#ff445530", glow: "#ff445555" };
  return             { label: "CRITICAL", hex: "#ff4455", dim: "#ff445545", glow: "#ff445577" };
};
const riskLabel = (l = "") => {
  const u = l.toUpperCase();
  if (u === "LOW")    return riskOf(10);
  if (u === "MEDIUM") return riskOf(40);
  if (u === "HIGH")   return riskOf(65);
  return riskOf(85);
};
const f2 = (v) => v == null ? "—" : Number(v).toFixed(2);
const f1 = (v) => v == null ? "—" : Number(v).toFixed(1);
const fi = (v) => v == null ? "—" : String(Math.round(Number(v)));
const fk = (v) => v == null ? "—" : Number(v) >= 1000
  ? `${(Number(v)/1000).toFixed(1)}K` : String(Math.round(Number(v)));

// ─── scanlines ──────────────────────────────────────────────────────────────
const Scanlines = () => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.055) 3px,rgba(0,0,0,0.055) 4px)",
  }} />
);

// ─── nav ────────────────────────────────────────────────────────────────────
function Nav({ id, name }) {
  const navigate = useNavigate();
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 200, height: 48,
      display: "flex", alignItems: "center", padding: "0 28px",
      background: "#070b12ee", backdropFilter: "blur(14px)",
      borderBottom: "1px solid #131c28",
    }}>
      <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginRight: 24 }}>
        <div style={{ width: 26, height: 26, borderRadius: 3, background: "linear-gradient(135deg,#00ff88,#00d4ff)", display: "grid", placeItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#070b12", fontFamily: "'Space Grotesk',sans-serif" }}>A</span>
        </div>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: "#e0eaf4" }}>
          Audit<span style={{ color: "#00ff88" }}>GPT</span>
        </span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
        <span onClick={() => navigate("/radar")} style={{ color: "#2a3850", cursor: "pointer" }}
          onMouseEnter={e => e.target.style.color = "#5a6a80"}
          onMouseLeave={e => e.target.style.color = "#2a3850"}>RADAR</span>
        <span style={{ color: "#131c28" }}>›</span>
        <span style={{ color: "#2a3850" }}>{id}</span>
        <span style={{ color: "#131c28" }}>›</span>
        <span style={{ color: "#00ff88" }}>REPORT</span>
      </div>
      <div style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textAlign: "right", lineHeight: 1.6 }}>
        <div style={{ color: "#00ff88" }}>{t.toLocaleTimeString("en-IN", { hour12: false })} IST</div>
        <div style={{ color: "#1e2838" }}>{t.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
      </div>
    </header>
  );
}

// ─── gauge ───────────────────────────────────────────────────────────────────
function Gauge({ score }) {
  const risk = riskOf(score);
  const R = 68, CX = 88, CY = 88;
  const C = 2 * Math.PI * R;
  const ARC = C * 0.75;
  const fill = ARC * (Math.min(Math.max(score, 0), 100) / 100);
  const ticks = [0, 25, 50, 75, 100].map(v => {
    const a = ((135 + v * 2.7) * Math.PI) / 180;
    return { x1: CX + (R-13)*Math.cos(a), y1: CY + (R-13)*Math.sin(a), x2: CX + (R-5)*Math.cos(a), y2: CY + (R-5)*Math.sin(a) };
  });
  return (
    <svg width="176" height="148" viewBox="0 0 176 148" style={{ flexShrink: 0 }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#0d1520" strokeWidth="10"
        strokeDasharray={`${ARC} ${C}`} strokeLinecap="round" transform={`rotate(135 ${CX} ${CY})`} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={risk.hex} strokeWidth="10"
        strokeDasharray={`${fill} ${C}`} strokeLinecap="round" transform={`rotate(135 ${CX} ${CY})`}
        style={{ filter: `drop-shadow(0 0 8px ${risk.hex}88)`, transition: "stroke-dasharray 1.1s cubic-bezier(.23,1,.32,1)" }} />
      {ticks.map((tk, i) => <line key={i} {...tk} stroke="#1a2535" strokeWidth="1.5" />)}
      <text x={CX} y={CY-2} textAnchor="middle" fill={risk.hex}
        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 32, fontWeight: 700, filter: `drop-shadow(0 0 10px ${risk.hex}77)` }}>{fi(score)}</text>
      <text x={CX} y={CY+16} textAnchor="middle" fill="#1e2d40"
        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8 }}>OUT OF 100</text>
      <text x={CX} y={CY+32} textAnchor="middle" fill={risk.hex}
        style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em" }}>{risk.label}</text>
      <text x="12"  y="142" fill="#1a2535" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7 }}>0</text>
      <text x="150" y="142" fill="#1a2535" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7 }}>100</text>
    </svg>
  );
}

// ─── breakdown bar ───────────────────────────────────────────────────────────
function BdRow({ label, weight, value, color }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "baseline" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: "#3a4a62", letterSpacing: "0.05em" }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#1e2838" }}>{weight}%</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color, minWidth: 26, textAlign: "right" }}>{fi(value)}</span>
        </div>
      </div>
      <div style={{ height: 3, background: "#0d1520", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, boxShadow: `0 0 5px ${color}66`, transition: "width 1s cubic-bezier(.23,1,.32,1)" }} />
      </div>
    </div>
  );
}

// ─── pane shell ──────────────────────────────────────────────────────────────
function Pane({ tag, title, accent = "#1a2535", action, children, style: sx = {} }) {
  return (
    <div style={{ background: "#090d16", border: "1px solid #111c2a", borderTop: `2px solid ${accent}`, borderRadius: 3, padding: "20px 22px 18px", ...sx }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          {tag && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#1e2d40", letterSpacing: "0.22em", marginBottom: 4 }}>{tag}</div>}
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: "#b8c8dc" }}>{title}</div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── empty state ─────────────────────────────────────────────────────────────
const Empty = ({ msg }) => (
  <div style={{ padding: "14px 0", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#1e2d40", letterSpacing: "0.04em" }}>{msg}</div>
);

// ─── kv row ──────────────────────────────────────────────────────────────────
const KV = ({ label, value, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px solid #0c1420" }}>
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#253040", letterSpacing: "0.06em", flexShrink: 0 }}>{label}</span>
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 600, color: color || "#4a5a70" }}>{value}</span>
  </div>
);

// ─── heatmap ─────────────────────────────────────────────────────────────────
function Heatmap({ anomalyMap, maxYear = null }) {
  if (!anomalyMap || !Object.keys(anomalyMap).length)
    return <Empty msg="No anomaly data — run precompute.py to generate z-scores" />;

  const metrics = Object.entries(anomalyMap);
  const allYears = [...new Set(metrics.flatMap(([, y]) => Object.keys(y || {})))]
    .filter(k => /^Mar \d{4}$/.test(k))
    .sort((a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1]));

  if (!allYears.length) return <Empty msg="No valid year keys found in anomaly map" />;

  // replay filter: hide columns after maxYear
  const visYears = maxYear
    ? allYears.filter(y => parseInt(y.split(" ")[1]) <= maxYear)
    : allYears;

  const allNull = metrics.every(([, y]) => visYears.every(yr => y?.[yr] == null));

  const cellBg = (z) => {
    if (z == null) return "#0b1018";
    const a = Math.abs(z);
    if (a < 0.5) return "#0b1018";
    if (a < 1.0) return z > 0 ? "#261508" : "#081510";
    if (a < 1.5) return z > 0 ? "#361b08" : "#082018";
    if (a < 2.0) return z > 0 ? "#4a2008" : "#082a20";
    if (a < 2.5) return z > 0 ? "#601810" : "#082e2e";
    return z > 0 ? "#801020" : "#083840";
  };
  const cellFg = (z) => {
    if (z == null) return "#1a2535";
    const a = Math.abs(z);
    if (a < 0.5) return "#253040";
    if (a < 1.5) return z > 0 ? "#c07830" : "#38a878";
    if (a < 2.5) return z > 0 ? "#ff8833" : "#00bb88";
    return z > 0 ? "#ff3344" : "#00ccee";
  };
  const abbr = (s) => s
    .replace("Interest Coverage Ratio", "ICR").replace("Inventory Turnover", "Inv TO")
    .replace("Asset Turnover", "AssetTO").replace("Dividend Payout", "DivPay")
    .replace("Earnings Per Share", "EPS").replace("Debtor Days", "DebtorD")
    .replace("Current Ratio", "CurRatio").replace("Debt to equity", "D/E");

  const CW = 44, LW = 116;

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: LW + visYears.length * (CW + 3) + 4 }}>
        {allNull && (
          <div style={{ background: "#0d1520", border: "1px dashed #1a2535", borderRadius: 2, padding: "8px 12px", marginBottom: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: "#2a3850" }}>
            ⚠ All z-scores null — peer group not computed yet. Grid shows structure only.
          </div>
        )}
        {/* year headers */}
        <div style={{ display: "flex", paddingLeft: LW + 4, marginBottom: 5 }}>
          {visYears.map(y => (
            <div key={y} style={{ width: CW, marginRight: 3, textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#253040" }}>
              '{y.split(" ")[1].slice(2)}
            </div>
          ))}
        </div>
        {/* metric rows */}
        {metrics.map(([metric, yd]) => (
          <div key={metric} style={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
            <div style={{ width: LW, paddingRight: 8, textAlign: "right", flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#304050", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {abbr(metric)}
            </div>
            {visYears.map(yr => {
              const z = yd?.[yr];
              return (
                <div key={yr} title={z != null ? `${metric} ${yr}: z=${f2(z)}` : `${metric} ${yr}: no data`}
                  style={{ width: CW, height: 25, marginRight: 3, borderRadius: 2, flexShrink: 0, background: cellBg(z), border: "1px solid #0d1520", display: "grid", placeItems: "center", cursor: "default" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7.5, fontWeight: z != null && Math.abs(z) >= 2 ? 700 : 400, color: cellFg(z) }}>
                    {z != null ? f1(z) : "·"}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        {/* legend */}
        <div style={{ display: "flex", gap: 12, marginTop: 12, paddingLeft: LW + 4, flexWrap: "wrap" }}>
          {[["#0b1018","#1a2535","<0.5σ"],["#4a2008","#ff8833","1–2σ+"],["#801020","#ff3344",">2σ+"],["#082a20","#00bb88","1–2σ−"],["#083840","#00ccee",">2σ−"]].map(([bg,fg,lbl]) => (
            <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `1px solid ${fg}44` }} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7.5, color: "#2a3850" }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── timeline ────────────────────────────────────────────────────────────────
// Real flag shape: { flag_type, severity, first_appeared (int year), evolution[], industry_context, citation }
function Timeline({ flags, replayYear = null }) {
  if (!flags?.length) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: "#00ff8877" }}>No red flags detected</span>
    </div>
  );

  // In replay mode: only show flags whose first_appeared <= replayYear
  const visible = replayYear != null
    ? flags.filter(f => f.first_appeared != null && Number(f.first_appeared) <= replayYear)
    : flags;

  const sevCol = (s = "") => {
    const u = s.toUpperCase();
    if (u === "CRITICAL" || u === "HIGH") return "#ff4455";
    if (u === "MEDIUM")  return "#ffb020";
    return "#00ff88";
  };

  if (visible.length === 0) return (
    <div style={{ padding: "14px 0", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#1e2d40" }}>
      No flags triggered before {replayYear} →
    </div>
  );

  return (
    <div style={{ position: "relative", paddingLeft: 20 }}>
      <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 1, background: "#111c2a" }} />
      {visible.map((f, i) => {
        const col = sevCol(f.severity);
        return (
          <div key={i} style={{ position: "relative", paddingBottom: 18 }}>
            <div style={{ position: "absolute", left: -17, top: 3, width: 11, height: 11, borderRadius: "50%", background: `${col}20`, border: `2px solid ${col}`, boxShadow: `0 0 7px ${col}66`, zIndex: 1 }} />
            {/* meta */}
            <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
              {f.first_appeared != null && (
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#3a4a60", background: "#0d1520", padding: "1px 7px", borderRadius: 2 }}>
                  {f.first_appeared}
                </span>
              )}
              {f.severity && (
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7.5, fontWeight: 700, color: col, background: `${col}18`, border: `1px solid ${col}40`, padding: "1px 7px", borderRadius: 2, letterSpacing: "0.1em" }}>
                  {f.severity.toUpperCase()}
                </span>
              )}
              {f.citation?.metric_name && (
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2a3850" }}>{f.citation.metric_name}</span>
              )}
            </div>
            {/* flag type */}
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12.5, fontWeight: 600, color: "#7080a0", marginBottom: 3 }}>
              {f.flag_type || f.description || f.flag || "—"}
            </div>
            {/* evolution entries */}
            {f.evolution?.map((ev, j) => (
              <div key={j} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11.5, color: "#4a5a70", lineHeight: 1.5, paddingLeft: 8, borderLeft: "2px solid #111c2a", marginTop: 4 }}>
                {ev}
              </div>
            ))}
            {/* industry context */}
            {f.industry_context && (
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2a3850", marginTop: 5, lineHeight: 1.5 }}>
                {f.industry_context}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── peer comparison ─────────────────────────────────────────────────────────
// Real peer shape: { name, sector, composite_score, fraud_risk }
function Peers({ currentName, currentScore, peers = [] }) {
  if (!peers.length) return <Empty msg="No peer data available" />;

  const all = [
    { name: currentName, composite_score: currentScore, isSelf: true },
    ...peers,
  ].sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0));

  const peak = Math.max(...all.map(c => c.composite_score ?? 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {all.map((c, i) => {
        const r = riskOf(c.composite_score ?? 0);
        const pct = ((c.composite_score ?? 0) / peak) * 100;
        return (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 48px",
            alignItems: "center", gap: 12, padding: "8px 12px",
            background: c.isSelf ? "#0f1a28" : "transparent",
            border: c.isSelf ? `1px solid ${r.dim}` : "1px solid transparent",
            borderRadius: 3,
          }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: c.isSelf ? 700 : 400, color: c.isSelf ? "#c8d8ec" : "#4a5a70", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {c.name}
              {c.isSelf && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#00ff8866", marginLeft: 6 }}>▶ THIS</span>}
            </div>
            <div style={{ height: 4, background: "#0a1018", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: r.hex, borderRadius: 2, boxShadow: c.isSelf ? `0 0 7px ${r.hex}66` : "none", transition: "width 0.9s cubic-bezier(.23,1,.32,1)" }} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: r.hex, textAlign: "right" }}>
              {fi(c.composite_score)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── financial chart (Sales vs Net Profit) ───────────────────────────────────
function FinChart({ financialData }) {
  if (!financialData?.profit_loss) return <Empty msg="No financial data" />;

  const pl = financialData.profit_loss;
  const salesRaw  = pl["Sales+"]      || pl["Sales"] || {};
  const profitRaw = pl["Net Profit+"] || pl["Net Profit"] || {};

  const years = Object.keys(salesRaw)
    .filter(k => /^Mar \d{4}$/.test(k))
    .sort((a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1]));

  if (!years.length) return <Empty msg="No annual sales data found" />;

  const sales  = years.map(y => salesRaw[y]  ?? 0);
  const profit = years.map(y => profitRaw[y] ?? 0);
  const maxVal = Math.max(...sales, 1);

  const W = 480, H = 100, PAD = 4;
  const xStep = (W - PAD * 2) / Math.max(years.length - 1, 1);

  const pt = (vals, i) => ({
    x: PAD + i * xStep,
    y: H - PAD - ((vals[i] / maxVal) * (H - PAD * 2)),
  });

  const pathD = (vals) =>
    vals.map((_, i) => `${i === 0 ? "M" : "L"} ${pt(vals,i).x} ${pt(vals,i).y}`).join(" ");

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H+28}`} style={{ minWidth: 320 }}>
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={PAD} y1={PAD + (1-f)*(H-PAD*2)} x2={W-PAD} y2={PAD + (1-f)*(H-PAD*2)}
            stroke="#0f1a28" strokeWidth="1" />
        ))}
        {/* sales area */}
        <path d={`${pathD(sales)} L ${pt(sales,years.length-1).x} ${H-PAD} L ${PAD} ${H-PAD} Z`}
          fill="#00d4ff0f" />
        <path d={pathD(sales)} fill="none" stroke="#00d4ff" strokeWidth="1.5"
          style={{ filter: "drop-shadow(0 0 4px #00d4ff55)" }} />
        {/* profit area */}
        <path d={`${pathD(profit)} L ${pt(profit,years.length-1).x} ${H-PAD} L ${PAD} ${H-PAD} Z`}
          fill="#00ff880a" />
        <path d={pathD(profit)} fill="none" stroke="#00ff88" strokeWidth="1.5"
          style={{ filter: "drop-shadow(0 0 4px #00ff8855)" }} />
        {/* data dots */}
        {years.map((_, i) => (
          <g key={i}>
            <circle cx={pt(sales,i).x} cy={pt(sales,i).y} r="2.5" fill="#00d4ff" />
            <circle cx={pt(profit,i).x} cy={pt(profit,i).y} r="2.5" fill="#00ff88" />
          </g>
        ))}
        {/* year labels */}
        {years.filter((_, i) => i % 2 === 0 || i === years.length - 1).map((y, _, arr) => {
          const origIdx = years.indexOf(y);
          return (
            <text key={y} x={pt(sales, origIdx).x} y={H + 18} textAnchor="middle"
              fill="#253040" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7 }}>
              '{y.split(" ")[1].slice(2)}
            </text>
          );
        })}
      </svg>
      {/* legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
        {[["#00d4ff","Revenue"],["#00ff88","Net Profit"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 16, height: 2, background: c, boxShadow: `0 0 4px ${c}` }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#3a4a60" }}>{l}</span>
          </div>
        ))}
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#1e2d40", marginLeft: "auto" }}>₹ Cr</span>
      </div>
    </div>
  );
}

// ─── sentiment ───────────────────────────────────────────────────────────────
function Sentiment({ data }) {
  if (!data || !Object.keys(data).length) return <Empty msg="No sentiment data available for this company" />;
  const years = Object.keys(data).sort();
  const vals  = years.map(y => { const v = data[y]; return typeof v === "object" ? (v.compound ?? 0) : Number(v) || 0; });
  const peak  = Math.max(...vals.map(Math.abs), 0.01);

  return (
    <div>
      <div style={{ position: "relative", height: 80, display: "flex", alignItems: "stretch", gap: 3 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "#111c2a" }} />
        {years.map((y, i) => {
          const v = vals[i], isPos = v >= 0;
          const h = `${(Math.abs(v) / peak) * 42}%`;
          const col = isPos ? "#00ff88" : "#ff4455";
          return (
            <div key={y} title={`${y}: ${v.toFixed(3)}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "default" }}>
              {isPos
                ? <div style={{ width: "65%", height: h, minHeight: 2, background: col, borderRadius: "2px 2px 0 0", opacity: 0.8, boxShadow: `0 0 5px ${col}55`, marginBottom: "50%" }} />
                : <div style={{ width: "65%", height: h, minHeight: 2, background: col, borderRadius: "0 0 2px 2px", opacity: 0.8, boxShadow: `0 0 5px ${col}55`, marginTop: "50%" }} />
              }
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", marginTop: 5, gap: 3 }}>
        {years.map(y => <div key={y} style={{ flex: 1, textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#1e2d40" }}>'{y.replace("Mar ","").slice(2)}</div>)}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
        {[["#00ff88","Positive"],["#ff4455","Negative"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 1, background: c }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#2a3850" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── narrative SSE ───────────────────────────────────────────────────────────
function Narrative({ companyId, preloaded }) {
  const [text, setText]   = useState("");
  const [live, setLive]   = useState(false);
  const [done, setDone]   = useState(false);
  const boxRef = useRef(null);

  // Don't pre-fill — always require explicit trigger for cinematic feel
  const run = useCallback(() => {
    if (live) return;
    setText(""); setDone(false); setLive(true);
    const es = new EventSource(`${API}/stream/${companyId}`);
    es.onmessage = (e) => {
      if (e.data === "[DONE]") { es.close(); setLive(false); setDone(true); return; }
      setText(p => p + e.data);
      if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
    };
    es.onerror = () => { es.close(); setLive(false); setDone(true); };
    return () => es.close();
  }, [companyId, live]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {live && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff88", animation: "pulseGreen 1s ease-in-out infinite" }} />}
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.12em", color: live ? "#00ff88" : done ? "#2a3850" : "#1a2838" }}>
            {live ? "STREAMING…" : done ? "ANALYSIS COMPLETE" : "GEMINI 1.5 FLASH"}
          </span>
        </div>
        <button onClick={run} disabled={live} style={{
          all: "unset", cursor: live ? "default" : "pointer",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
          color: live ? "#1e2838" : "#00ff88",
          background: live ? "#090d14" : "#00ff8810",
          border: `1px solid ${live ? "#111c2a" : "#00ff8840"}`,
          padding: "5px 14px", borderRadius: 2, letterSpacing: "0.08em", transition: "all 0.15s",
        }}>
          {done ? "↺ REGENERATE" : "▶ GENERATE"}
        </button>
      </div>
      <div ref={boxRef} style={{
        background: "#060a10", border: "1px solid #0f1820", borderRadius: 3,
        padding: "14px 16px", minHeight: 110, maxHeight: 340, overflowY: "auto",
        fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "#7888a0",
        lineHeight: 1.8, whiteSpace: "pre-wrap",
      }}>
        {text
          ? <>{text}{live && <span style={{ color: "#00ff88", animation: "blink 0.7s step-end infinite" }}>▌</span>}</>
          : <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#131c28" }}>
              {preloaded
                ? "Cached narrative available — click GENERATE to stream fresh analysis"
                : "Click ▶ GENERATE to run Gemini forensic narrative…"}
            </span>
        }
      </div>
    </div>
  );
}

// ─── satyam replay control ───────────────────────────────────────────────────
function ReplayControl({ years, currentYear, onYearChange, playing, onPlay, onPause, onReset }) {
  const idx = years.indexOf(currentYear);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#060a10", border: "1px solid #111c2a", borderRadius: 3 }}>
      {/* play/pause */}
      <button onClick={playing ? onPause : onPlay} style={{
        all: "unset", cursor: "pointer", width: 28, height: 28, borderRadius: 2,
        background: playing ? "#ffb02018" : "#00ff8818",
        border: `1px solid ${playing ? "#ffb02044" : "#00ff8844"}`,
        display: "grid", placeItems: "center",
        color: playing ? "#ffb020" : "#00ff88",
        fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
        transition: "all 0.15s",
      }}>
        {playing ? "⏸" : "▶"}
      </button>

      {/* reset */}
      <button onClick={onReset} style={{
        all: "unset", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
        fontSize: 9, color: "#2a3850", letterSpacing: "0.06em",
      }}>↺</button>

      {/* slider */}
      <input type="range" min={0} max={years.length - 1} value={idx < 0 ? 0 : idx}
        onChange={e => onYearChange(years[parseInt(e.target.value)])}
        style={{ flex: 1, accentColor: "#00ff88", height: 3, cursor: "pointer" }} />

      {/* year label */}
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: "#00ff88", minWidth: 56, textAlign: "right" }}>
        {currentYear || "—"}
      </div>

      {/* progress */}
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#1e2d40" }}>
        {idx + 1}/{years.length}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Report() {
  const { companyId } = useParams();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState(null);

  // replay state
  const [replayMode, setReplayMode] = useState(false);
  const [replayYear, setReplayYear] = useState(null);
  const [playing, setPlaying]       = useState(false);
  const playRef = useRef(null);

  useEffect(() => {
    setLoading(true); setErr(null); setReport(null);
    fetch(`${API}/report/${companyId}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { setReport(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, [companyId]);

  // derive replay years from heatmap keys
  const replayYears = report
    ? [...new Set(
        Object.values(report.anomaly_map || {}).flatMap(y => Object.keys(y || {}))
      )].filter(k => /^Mar \d{4}$/.test(k)).sort((a,b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1]))
    : [];

  const startReplay = () => {
    if (!replayYears.length) return;
    setReplayMode(true);
    setReplayYear(replayYears[0]);
    setPlaying(true);
  };

  const stopReplay = () => {
    clearInterval(playRef.current);
    setPlaying(false);
    setReplayMode(false);
    setReplayYear(null);
  };

  // auto-advance
  useEffect(() => {
    clearInterval(playRef.current);
    if (!playing || !replayMode || !replayYears.length) return;
    playRef.current = setInterval(() => {
      setReplayYear(prev => {
        const idx = replayYears.indexOf(prev);
        if (idx >= replayYears.length - 1) {
          clearInterval(playRef.current);
          setPlaying(false);
          return prev;
        }
        return replayYears[idx + 1];
      });
    }, 900);
    return () => clearInterval(playRef.current);
  }, [playing, replayMode, replayYears.join(",")]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#070b12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ width: 30, height: 30, border: "2px solid #0d1520", borderTop: "2px solid #00ff88", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#1e2d40", letterSpacing: "0.14em" }}>LOADING FORENSIC REPORT…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (err || !report) return (
    <div style={{ minHeight: "100vh", background: "#070b12", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0f0a12", border: "1px solid #ff445530", borderLeft: "3px solid #ff4455", borderRadius: 3, padding: "16px 22px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#ff5566" }}>
        ⚠ {err || "Unknown error"} — could not load {companyId}
      </div>
    </div>
  );

  const risk  = riskLabel(report.risk_level);
  const bd    = report.breakdown  || {};
  const ben   = report.beneish   || {};
  const alt   = report.altman    || {};
  const flags = report.red_flags || [];

  const benZone = ben.manipulation_likely
    ? { label: "MANIPULATION LIKELY", verdict: "⚠ RISKY",  color: "#ff4455" }
    : { label: "BELOW THRESHOLD",     verdict: "✓ CLEAN",  color: "#00ff88" };

  const altZone = (() => {
    const z = (alt.zone || "").toLowerCase();
    if (z === "safe")     return { label: "SAFE ZONE",     color: "#00ff88" };
    if (z === "distress") return { label: "DISTRESS ZONE", color: "#ff4455" };
    return                       { label: "GREY ZONE",     color: "#ffb020" };
  })();

  const replayYearInt = replayYear ? parseInt(replayYear.split(" ")[1]) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#070b12", color: "#c0ccd8" }}>
      <Scanlines />
      {/* <Nav id={report.company_id} name={report.company_name} /> */}
<Navbar />
      {/* accent strip */}
      <div style={{ height: 2, background: `linear-gradient(90deg,${risk.hex} 0%,${risk.dim} 55%,transparent 100%)` }} />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 26px 80px" }}>

        {/* ══ HERO ════════════════════════════════════════════════ */}
        <div style={{
          display: "grid", gridTemplateColumns: "auto 1fr auto",
          gap: 26, alignItems: "start",
          background: "#090d16", border: "1px solid #111c2a",
          borderTop: `2px solid ${risk.hex}`,
          borderRadius: 3, padding: "24px 28px", marginBottom: 12,
        }}>
          <Gauge score={report.composite_score} />

          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#1e2d40", letterSpacing: "0.22em", marginBottom: 7 }}>
              NSE · {(report.sector || "").toUpperCase()} · FORENSIC ANALYSIS
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 21, fontWeight: 800, color: "#dce8f4", margin: "0 0 2px", lineHeight: 1.15 }}>
              {report.company_name}
            </h1>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#253040", marginBottom: 16 }}>
              {report.company_id}
            </div>
            {report.risk_reasoning && (
              <div style={{
                background: `${risk.hex}08`, border: `1px solid ${risk.dim}`,
                borderLeft: `3px solid ${risk.hex}`, borderRadius: 2,
                padding: "9px 13px", fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 12, color: "#5a6a82", lineHeight: 1.65, maxWidth: 460,
              }}>
                {report.risk_reasoning}
              </div>
            )}
          </div>

          <div style={{ minWidth: 205 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#1e2d40", letterSpacing: "0.22em", marginBottom: 12 }}>SCORE BREAKDOWN</div>
            <BdRow label="BENEISH M-SCORE"   weight={35} value={bd.beneish_normalized}    color="#00d4ff" />
            <BdRow label="ALTMAN Z-SCORE"    weight={30} value={bd.altman_normalized}     color="#ffb020" />
            <BdRow label="INDUSTRY Z-SCORE"  weight={25} value={bd.industry_z_normalized} color="#a855f7" />
            <BdRow label="TREND BREAKS"      weight={10} value={bd.trend_break_normalized} color="#ff4455" />
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #111c2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7.5, color: "#1e2d40", letterSpacing: "0.1em" }}>COMPOSITE</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 19, fontWeight: 700, color: risk.hex, textShadow: `0 0 12px ${risk.hex}55` }}>{fi(report.composite_score)}</span>
            </div>
          </div>
        </div>

        {/* ══ HEATMAP ═════════════════════════════════════════════ */}
        <Pane
          tag={replayMode ? `REPLAY MODE · ${replayYear || "—"}` : "INDUSTRY-ADJUSTED Z-SCORES · 10-YEAR VIEW"}
          title="Anomaly Heatmap"
          accent={replayMode ? "#ffb020" : "#00d4ff"}
          style={{ marginBottom: 12 }}
          action={
            replayMode ? (
              <button onClick={stopReplay} style={{ all: "unset", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#ffb020", background: "#ffb02015", border: "1px solid #ffb02040", padding: "4px 10px", borderRadius: 2, letterSpacing: "0.08em" }}>
                ✕ EXIT REPLAY
              </button>
            ) : replayYears.length > 0 ? (
              <button onClick={startReplay} style={{ all: "unset", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#3a4a60", background: "#0d1520", border: "1px solid #1a2535", padding: "4px 10px", borderRadius: 2, letterSpacing: "0.08em" }}>
                ▶ REPLAY
              </button>
            ) : null
          }
        >
          {replayMode && replayYears.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {/* <ReplayControl
                years={replayYears}
                currentYear={replayYear}
                onYearChange={setReplayYear}
                playing={playing}
                onPlay={() => {
                  if (replayYear === replayYears[replayYears.length - 1]) {
                    setReplayYear(replayYears[0]);
                  }
                  setPlaying(true);
                }}
                onPause={() => setPlaying(false)}
                onReset={() => { setPlaying(false); setReplayYear(replayYears[0]); }}
              /> */}
            </div>
          )}
          {/* <SatyamReplaySection />`` */}
          <Heatmap anomalyMap={report.anomaly_map} maxYear={replayYearInt} />
        </Pane>

        {/* ══ FLAGS + PEERS ════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Pane tag={`${flags.length} FLAG${flags.length !== 1 ? "S" : ""} DETECTED`} title="Red Flag Timeline" accent="#ff4455">
            <Timeline flags={flags} replayYear={replayMode ? replayYearInt : null} />
          </Pane>
          <Pane tag={`${report.sector} · SECTOR BENCHMARK`} title="Peer Comparison" accent="#a855f7">
            <Peers currentName={report.company_name} currentScore={report.composite_score} peers={report.peer_companies} />
          </Pane>
        </div>

        {/* ══ BENEISH + ALTMAN ════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Pane tag="EARNINGS MANIPULATION · BENEISH (1999)" title="M-Score Analysis" accent="#00d4ff">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: benZone.color, lineHeight: 1 }}>{f2(ben.m_score)}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7.5, color: benZone.color, marginTop: 5, letterSpacing: "0.1em" }}>{benZone.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#1e2d40", marginTop: 2 }}>threshold: −1.78</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: benZone.color, background: `${benZone.color}15`, border: `1px solid ${benZone.color}40`, padding: "4px 10px", borderRadius: 2, letterSpacing: "0.08em" }}>
                {benZone.verdict}
              </div>
            </div>
            {ben.components && Object.entries(ben.components).map(([k,v]) => <KV key={k} label={k} value={f2(v)} />)}
          </Pane>
          <Pane tag="BANKRUPTCY PREDICTION · ALTMAN (1968)" title="Z-Score Analysis" accent="#ffb020">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: altZone.color, lineHeight: 1 }}>{f2(alt.z_score)}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7.5, color: altZone.color, marginTop: 5, letterSpacing: "0.1em" }}>{altZone.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#1e2d40", marginTop: 2 }}>safe &gt; 2.99 · distress &lt; 1.81</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: altZone.color, background: `${altZone.color}15`, border: `1px solid ${altZone.color}40`, padding: "4px 10px", borderRadius: 2, letterSpacing: "0.08em" }}>
                {(alt.zone || "—").toUpperCase()}
              </div>
            </div>
            {alt.components && Object.entries(alt.components).map(([k,v]) => <KV key={k} label={k} value={f2(v)} />)}
          </Pane>
        </div>

        {/* ══ FINANCIALS + SENTIMENT ══════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12, marginBottom: 12 }}>
          <Pane tag="PROFIT & LOSS · REVENUE vs NET PROFIT" title="Financial Trend" accent="#00d4ff">
            <FinChart financialData={report.financial_data} />
          </Pane>
          <Pane tag="VADER SENTIMENT · NEWS & FILINGS" title="Sentiment Trend" accent="#00ff88">
            <Sentiment data={report.sentiment_trend} />
          </Pane>
        </div>

        {/* ══ NARRATIVE ═══════════════════════════════════════════ */}
        <Pane tag="GEMINI 1.5 FLASH · LLM FORENSIC ANALYSIS" title="Narrative" accent="#00ff88">
          <Narrative companyId={companyId} preloaded={report.narrative} />
        </Pane>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        body{margin:0;background:#070b12;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#070b12}
        ::-webkit-scrollbar-thumb{background:#111c2a;border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:#1a2838}
        input[type=range]{-webkit-appearance:none;background:transparent}
        input[type=range]::-webkit-slider-runnable-track{height:3px;background:#0f1a28;border-radius:2px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#00ff88;margin-top:-4.5px;box-shadow:0 0 6px #00ff8888;cursor:pointer}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseGreen{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>
    </div>
  );
}