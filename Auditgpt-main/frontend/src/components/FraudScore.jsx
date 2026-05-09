import './FraudScore.css'

const RISK_COLORS = {
  Low: '#00ff88',
  Medium: '#ffa500',
  High: '#ff4444',
  Critical: '#ff4444',
}

export default function FraudScore({ composite_score, risk_level, breakdown, beneish, altman }) {
  const color = RISK_COLORS[risk_level] || '#6b7280'
  const circumference = 2 * Math.PI * 80
  const progress = (composite_score / 100) * circumference

  const glowColor = risk_level === 'Low' ? 'rgba(0, 255, 136, 0.25)' :
                     risk_level === 'Medium' ? 'rgba(255, 165, 0, 0.25)' :
                     'rgba(255, 68, 68, 0.3)'

  return (
    <div className="fraud-score" style={{ '--score-glow': glowColor }}>
      <h3 className="component-label">COMPOSITE FRAUD RISK</h3>

      <div className="score-ring-container">
        <svg viewBox="0 0 200 200" className="score-ring">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#1a1f2e" strokeWidth="10" />
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <div className="score-center">
          <div className="score-value mono" style={{ color }}>{composite_score.toFixed(0)}</div>
          <div className="score-max mono">/100</div>
        </div>
      </div>

      <div className={`risk-badge badge badge-${risk_level.toLowerCase()}`}>
        {risk_level}
      </div>

      <div className="score-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label">Beneish M-Score</span>
          <span className="breakdown-value mono">
            {beneish?.m_score != null ? beneish.m_score.toFixed(2) : 'N/A'}
          </span>
          <span className={`breakdown-flag ${beneish?.manipulation_likely ? 'flag-warn' : 'flag-ok'}`}>
            {beneish?.manipulation_likely ? 'MANIPULATION LIKELY' : 'NORMAL'}
          </span>
        </div>

        <div className="breakdown-item">
          <span className="breakdown-label">Altman Z-Score</span>
          <span className="breakdown-value mono">
            {altman?.z_score != null ? altman.z_score.toFixed(2) : 'N/A'}
          </span>
          <span className={`breakdown-flag ${altman?.zone === 'distress' ? 'flag-warn' : altman?.zone === 'grey' ? 'flag-caution' : 'flag-ok'}`}>
            {altman?.zone?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>

        <div className="breakdown-divider" />

        <div className="breakdown-weights">
          <div className="weight-row">
            <span>Beneish (35%)</span>
            <div className="weight-bar">
              <div className="weight-fill" style={{ width: `${breakdown?.beneish_normalized || 0}%`, background: color }} />
            </div>
            <span className="mono">{breakdown?.beneish_normalized?.toFixed(0) || 0}</span>
          </div>
          <div className="weight-row">
            <span>Altman (30%)</span>
            <div className="weight-bar">
              <div className="weight-fill" style={{ width: `${breakdown?.altman_normalized || 0}%`, background: color }} />
            </div>
            <span className="mono">{breakdown?.altman_normalized?.toFixed(0) || 0}</span>
          </div>
          <div className="weight-row">
            <span>Industry Z (25%)</span>
            <div className="weight-bar">
              <div className="weight-fill" style={{ width: `${breakdown?.industry_z_normalized || 0}%`, background: color }} />
            </div>
            <span className="mono">{breakdown?.industry_z_normalized?.toFixed(0) || 0}</span>
          </div>
          <div className="weight-row">
            <span>Trend Breaks (10%)</span>
            <div className="weight-bar">
              <div className="weight-fill" style={{ width: `${breakdown?.trend_break_normalized || 0}%`, background: color }} />
            </div>
            <span className="mono">{breakdown?.trend_break_normalized?.toFixed(0) || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
