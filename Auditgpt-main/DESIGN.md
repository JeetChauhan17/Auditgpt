# Design System — AuditGPT

## Product Context
- **What this is:** Financial statement forensics engine that detects fraud in NSE-listed Indian companies using quantitative analysis + LLM narratives
- **Who it's for:** Auditors, financial analysts, and hackathon judges evaluating forensic accounting tools
- **Space/industry:** FinTech / forensic accounting / regulatory compliance
- **Project type:** Data-dense dashboard with interactive visualizations

## Aesthetic Direction
- **Direction:** Retro-Futuristic Terminal — Bloomberg meets hacker aesthetic
- **Decoration level:** Intentional — subtle glow effects on active elements, clean dark surfaces, card borders that disappear into the void
- **Mood:** Raw, unfiltered forensic truth. The green-on-black is a terminal. The monospace is data. The flat cards are dossier pages. Nothing is decorative — everything is evidence.

## Typography
- **Display/Hero:** JetBrains Mono 700 — numbers ARE the content, monospace is the brand
- **Body:** Inter 400/500 — clean readability for narrative text and descriptions
- **UI/Labels:** JetBrains Mono 400 uppercase with 0.5-1px letter-spacing
- **Data/Tables:** JetBrains Mono 400 with font-variant-numeric: tabular-nums
- **Code:** JetBrains Mono 400
- **Loading:** Google Fonts CDN — `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap`
- **Scale:**
  - 11px — labels, captions, badges (mono, uppercase)
  - 12px — table data, small metrics
  - 13px — body text, buttons, data cells
  - 14px — narrative body, descriptions
  - 16px — section headers
  - 24px — component titles, company names
  - 36px — hero score number
  - 42px — page title (AuditGPT brand)

## Color
- **Approach:** Restrained semantic — color is NEVER decorative, always meaningful
- **Primary:** #00ff88 (neon green) — safe/low risk, primary CTA, brand accent
- **Primary Dim:** #00cc6a — hover/active states
- **Warning:** #ffa500 (amber) — medium risk
- **Danger:** #ff4444 (red) — high & critical risk
- **Danger Dim:** #cc3333 — hover/active danger states
- **Info:** #3b82f6 (blue) — neutral data, informational alerts
- **Accent:** #06b6d4 (cyan) — highlights, secondary accents
- **Neutrals (dark to light surfaces):**
  - #0a0e17 — page background (bg-primary)
  - #111827 — input/inset surfaces (bg-secondary)
  - #1a1f2e — card/panel surfaces (bg-card)
  - #232838 — card hover state (bg-card-hover)
  - #2a3040 — borders, dividers (border)
- **Text:**
  - #e5e7eb — primary text (text-primary)
  - #9ca3af — secondary text (text-secondary)
  - #6b7280 — muted text, labels (text-muted)
- **Semantic alpha overlays (for badges/alerts):**
  - Low: rgba(0,255,136,0.15) bg, rgba(0,255,136,0.3) border
  - Medium: rgba(255,165,0,0.15) bg, rgba(255,165,0,0.3) border
  - High: rgba(255,68,68,0.15) bg, rgba(255,68,68,0.3) border
  - Critical: rgba(255,68,68,0.25) bg, rgba(255,68,68,0.5) border + pulse animation

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — financial data needs breathing room but not waste
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)
- **Card padding:** 24px standard, 32px hero cards
- **Section gaps:** 24px between cards, 48-64px between page sections

## Layout
- **Approach:** Grid-disciplined — predictable alignment, data-dense
- **Grid:** Hero section: 2-column (score | heatmap), detail sections: 2-column, full-width for narrative
- **Max content width:** 1200px
- **Border radius:** sm:4px (badges, inputs, buttons), md:6px (cards), full:50% (dots, avatars only)
- **Hero section:** FraudScore + AnomalyMap fill viewport width
- **Scroll behavior:** Hero section is viewport-height, detail sections scroll below

## Motion
- **Approach:** Minimal-functional — data transitions only, no decorative motion
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) for hover, short(150-250ms) for state changes, medium(300-500ms) for ring gauge animation
- **Animations used:**
  - SVG ring gauge: stroke-dashoffset transition (0.5s ease-out)
  - Cursor blink: step-end 1s infinite (narrative streaming)
  - Critical pulse: opacity 0.7-1.0, 2s ease-in-out infinite
  - Satyam replay: interval-based year progression with dot scale transitions (0.3s)
- **No:** page transitions, entrance animations, scroll-driven effects, loading skeletons with shimmer

## CSS Variables Reference
```css
:root {
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-card: #1a1f2e;
  --bg-card-hover: #232838;
  --border: #2a3040;
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --green: #00ff88;
  --green-dim: #00cc6a;
  --amber: #ffa500;
  --red: #ff4444;
  --red-dim: #cc3333;
  --blue: #3b82f6;
  --cyan: #06b6d4;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-03-24 | Bloomberg Terminal dark theme selected | Hackathon differentiator — institutional credibility with hacker edge |
| 2025-03-24 | JetBrains Mono + Inter font pairing | Mono for all data/numbers (brand identity), Inter for narrative readability |
| 2025-03-24 | Neon green (#00ff88) as primary | Aggressive, memorable — "hacker discovering fraud" not "corporate compliance" |
| 2025-03-24 | Semantic-only color usage | Green/amber/red map to risk levels — no decorative color anywhere |
| 2025-03-24 | No rounded corners beyond 6px | Brutally flat reinforces "serious forensic tool" aesthetic |
| 2025-03-25 | Design system formalized | Created by /design-consultation based on existing implementation |
