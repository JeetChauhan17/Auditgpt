import { useMemo } from 'react'
import './AnomalyMap.css'

function zToColor(z) {
  if (z === null || z === undefined) return '#111827'
  const abs = Math.abs(z)
  if (abs < 1) return 'rgba(0, 255, 136, 0.12)'
  if (abs < 2) return 'rgba(255, 165, 0, 0.15)'
  if (abs < 3) return 'rgba(255, 68, 68, 0.18)'
  return 'rgba(255, 68, 68, 0.35)'
}

function zToSeverity(z) {
  if (z === null || z === undefined) return 'na'
  const abs = Math.abs(z)
  if (abs < 1) return 'normal'
  if (abs < 2) return 'watch'
  if (abs < 3) return 'anomaly'
  return 'severe'
}

function zToLabel(z) {
  if (z === null || z === undefined) return '-'
  return z.toFixed(1)
}

function zToSeverityLabel(z) {
  if (z === null || z === undefined) return 'No data'
  const abs = Math.abs(z)
  if (abs < 1) return 'Normal'
  if (abs < 2) return 'Watch'
  if (abs < 3) return 'Anomaly'
  return 'Severe'
}

export default function AnomalyMap({ anomaly_map, satyamOverlay, maxYear }) {
  const { ratios, years, stats } = useMemo(() => {
    if (!anomaly_map) return { ratios: [], years: [], stats: { normal: 0, watch: 0, anomaly: 0, severe: 0 } }

    const allYears = new Set()
    for (const yearScores of Object.values(anomaly_map)) {
      Object.keys(yearScores).forEach(y => allYears.add(y))
    }
    let sortedYears = [...allYears].sort()
    if (maxYear) {
      sortedYears = sortedYears.filter(y => y <= String(maxYear))
    }

    // Count severity distribution
    const stats = { normal: 0, watch: 0, anomaly: 0, severe: 0 }
    for (const ratio of Object.keys(anomaly_map)) {
      for (const y of sortedYears) {
        const z = anomaly_map[ratio]?.[y]
        if (z !== null && z !== undefined) {
          const sev = zToSeverity(z)
          if (sev !== 'na') stats[sev]++
        }
      }
    }

    return {
      ratios: Object.keys(anomaly_map),
      years: sortedYears,
      stats,
    }
  }, [anomaly_map, maxYear])

  if (!anomaly_map || ratios.length === 0) {
    return <div className="anomaly-map empty">No anomaly data available</div>
  }

  const total = stats.normal + stats.watch + stats.anomaly + stats.severe

  return (
    <div className="anomaly-map">
      <h3 className="component-label">ANOMALY MAP — Industry-Adjusted Z-Scores</h3>
      <div className="legend">
        <span className="legend-item"><span className="legend-swatch" style={{ background: 'rgba(0, 255, 136, 0.25)' }} /> Normal</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: 'rgba(255, 165, 0, 0.3)' }} /> Watch</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: 'rgba(255, 68, 68, 0.3)' }} /> Anomaly</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: 'rgba(255, 68, 68, 0.55)' }} /> Severe</span>
      </div>
      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="ratio-header">Ratio</th>
              {years.map(y => (
                <th key={y} className="year-header mono">{y.replace('Mar ', "'")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ratios.map(ratio => (
              <tr key={ratio}>
                <td className="ratio-name">{ratio}</td>
                {years.map(y => {
                  const z = anomaly_map[ratio]?.[y]
                  const severity = zToSeverity(z)
                  return (
                    <td
                      key={y}
                      className={`heatmap-cell severity-${severity}`}
                      style={{
                        background: zToColor(z),
                        transition: 'background 0.4s ease, filter 0.15s ease',
                      }}
                    >
                      <span className="cell-value mono">{zToLabel(z)}</span>
                      <div className="cell-tooltip">
                        <div className="tooltip-ratio">{ratio}</div>
                        <div className="tooltip-value" style={{
                          color: severity === 'normal' ? '#4ade80' :
                                 severity === 'watch' ? '#fbbf24' :
                                 severity === 'anomaly' ? '#f87171' :
                                 severity === 'severe' ? '#fca5a5' : '#6b7280'
                        }}>
                          z = {zToLabel(z)} — {zToSeverityLabel(z)}
                        </div>
                        <div className="tooltip-label">{y}</div>
                      </div>
                      {satyamOverlay && satyamOverlay[ratio]?.[y] != null && (
                        <span className="satyam-dot" title={`Satyam: ${satyamOverlay[ratio][y]}`}>
                          ◆
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 0 && (
        <div className="heatmap-summary">
          <span className="summary-stat">
            <span className="stat-value green">{stats.normal}</span> Normal
          </span>
          <span className="summary-stat">
            <span className="stat-value amber">{stats.watch}</span> Watch
          </span>
          <span className="summary-stat">
            <span className="stat-value red">{stats.anomaly + stats.severe}</span> Anomalies
          </span>
          <span className="summary-stat">
            {total} total data points
          </span>
        </div>
      )}
    </div>
  )
}
