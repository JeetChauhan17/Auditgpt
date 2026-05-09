import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './PeerComparison.css'

const RISK_COLORS = {
  Low: '#00ff88',
  Medium: '#ffa500',
  High: '#ff4444',
  Critical: '#ff4444',
}

export default function PeerComparison({ company_name, composite_score, risk_level, peer_companies }) {
  if (!peer_companies || peer_companies.length === 0) {
    return <div className="peer-comparison empty">No peer data available</div>
  }

  const chartData = [
    { name: company_name?.split(' ')[0] || 'Company', score: composite_score, risk: risk_level, isTarget: true },
    ...peer_companies.map(p => ({
      name: p.name?.split(' ')[0] || 'Peer',
      score: p.composite_score || 0,
      risk: p.fraud_risk || 'Low',
      isTarget: false,
    })),
  ].sort((a, b) => b.score - a.score)

  return (
    <div className="peer-comparison">
      <h3 className="component-label">PEER COMPARISON — Sector Risk Ranking</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              width={75}
            />
            <Tooltip
              contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3040', borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12 }}
              labelStyle={{ color: '#e5e7eb' }}
              formatter={(value) => [`${value.toFixed(1)}/100`, 'Risk Score']}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isTarget ? RISK_COLORS[entry.risk] : `${RISK_COLORS[entry.risk]}80`}
                  stroke={entry.isTarget ? '#fff' : 'none'}
                  strokeWidth={entry.isTarget ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="peer-table">
        {peer_companies.map((p, i) => (
          <div key={i} className="peer-row">
            <span className="peer-name">{p.name}</span>
            <span className={`badge badge-${(p.fraud_risk || 'low').toLowerCase()}`}>
              {p.fraud_risk || 'N/A'}
            </span>
            <span className="peer-score mono">{(p.composite_score || 0).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
