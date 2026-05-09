import { useState, useMemo } from 'react'
import './RedFlagTimeline.css'

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 }
const SEVERITY_COLORS = {
  Critical: '#ff4444',
  High: '#ff4444',
  Medium: '#ffa500',
  Low: '#00ff88',
}

function worstSeverity(flags) {
  let worst = 'Low'
  for (const f of flags) {
    if ((SEVERITY_ORDER[f.severity] ?? 4) < (SEVERITY_ORDER[worst] ?? 4)) {
      worst = f.severity
    }
  }
  return worst
}

export default function RedFlagTimeline({ red_flags, maxYear }) {
  const [expandedIdx, setExpandedIdx] = useState(null)

  const { filtered, byYear, sortedYears, counts } = useMemo(() => {
    const f = maxYear
      ? (red_flags || []).filter(flag => flag.first_appeared <= maxYear)
      : (red_flags || [])

    const by = {}
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    for (const flag of f) {
      const year = flag.first_appeared || 'Unknown'
      if (!by[year]) by[year] = []
      by[year].push(flag)
      counts[flag.severity] = (counts[flag.severity] || 0) + 1
    }

    return {
      filtered: f,
      byYear: by,
      sortedYears: Object.keys(by).sort(),
      counts,
    }
  }, [red_flags, maxYear])

  if (!red_flags || red_flags.length === 0) {
    return (
      <div className="red-flag-timeline empty">
        <h3 className="component-label">RED FLAG TIMELINE</h3>
        <p>No red flags detected — financial metrics within normal ranges.</p>
      </div>
    )
  }

  const total = filtered.length
  const toggleExpand = (globalIdx) => {
    setExpandedIdx(expandedIdx === globalIdx ? null : globalIdx)
  }

  let globalIdx = 0

  return (
    <div className="red-flag-timeline">
      <h3 className="component-label">RED FLAG TIMELINE — {total} flags detected</h3>

      {/* Summary bar */}
      <div className="flag-summary">
        {counts.Critical > 0 && (
          <>
            <div className="flag-count">
              <span className="count-num critical">{counts.Critical}</span>
              <span>Critical</span>
            </div>
            <div className="flag-count-divider" />
          </>
        )}
        {counts.High > 0 && (
          <>
            <div className="flag-count">
              <span className="count-num high">{counts.High}</span>
              <span>High</span>
            </div>
            <div className="flag-count-divider" />
          </>
        )}
        {counts.Medium > 0 && (
          <>
            <div className="flag-count">
              <span className="count-num medium">{counts.Medium}</span>
              <span>Medium</span>
            </div>
            <div className="flag-count-divider" />
          </>
        )}
        {counts.Low > 0 && (
          <div className="flag-count">
            <span className="count-num low">{counts.Low}</span>
            <span>Low</span>
          </div>
        )}
        <div className="severity-bar">
          {counts.Critical > 0 && (
            <div className="severity-bar-segment" style={{ width: `${(counts.Critical / total) * 100}%`, background: '#ff4444' }} />
          )}
          {counts.High > 0 && (
            <div className="severity-bar-segment" style={{ width: `${(counts.High / total) * 100}%`, background: '#cc3333' }} />
          )}
          {counts.Medium > 0 && (
            <div className="severity-bar-segment" style={{ width: `${(counts.Medium / total) * 100}%`, background: '#ffa500' }} />
          )}
          {counts.Low > 0 && (
            <div className="severity-bar-segment" style={{ width: `${(counts.Low / total) * 100}%`, background: '#00ff88' }} />
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {sortedYears.map(year => {
          const flags = byYear[year]
          const worst = worstSeverity(flags)
          return (
            <div key={year} className="timeline-year">
              <div className="year-marker">
                <div className={`year-dot dot-${worst.toLowerCase()}`} />
                <span className="year-label mono">{year}</span>
                <span className="year-count">{flags.length} flag{flags.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="year-flags">
                {flags.map((flag, i) => {
                  const idx = globalIdx++
                  const isExpanded = expandedIdx === idx
                  return (
                    <div
                      key={i}
                      className={`flag-card sev-${flag.severity.toLowerCase()} ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleExpand(idx)}
                    >
                      <div className="flag-header">
                        <span className={`badge badge-${flag.severity.toLowerCase()}`}>{flag.severity}</span>
                        <span className="flag-type">{flag.flag_type}</span>
                        <span className="flag-expand">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                      {isExpanded && (
                        <div className="flag-body">
                          {flag.industry_context && (
                            <p className="flag-context">{flag.industry_context}</p>
                          )}
                          {flag.evolution?.[0] && (
                            <div className="flag-evolution">{flag.evolution[0]}</div>
                          )}
                          {flag.citation && (
                            <div className="flag-citation">
                              {flag.citation.filing_year > 0 && (
                                <div className="citation-item">
                                  <span className="citation-label">Year</span>
                                  <span className="citation-value">{flag.citation.filing_year}</span>
                                </div>
                              )}
                              {flag.citation.filing_type && (
                                <div className="citation-item">
                                  <span className="citation-label">Filing</span>
                                  <span className="citation-value">{flag.citation.filing_type}</span>
                                </div>
                              )}
                              {flag.citation.metric_name && (
                                <div className="citation-item">
                                  <span className="citation-label">Metric</span>
                                  <span className="citation-value">{flag.citation.metric_name}</span>
                                </div>
                              )}
                              {flag.citation.source && (
                                <div className="citation-item">
                                  <span className="citation-label">Source</span>
                                  <span className="citation-value">{flag.citation.source}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
