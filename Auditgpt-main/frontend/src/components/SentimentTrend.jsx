import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import './SentimentTrend.css'

export default function SentimentTrend({ sentiment_trend }) {
  if (!sentiment_trend || Object.keys(sentiment_trend).length === 0) {
    return (
      <div className="sentiment-trend empty">
        <h3 className="component-label">SENTIMENT TREND</h3>
        <p>No sentiment data available</p>
      </div>
    )
  }

  const data = Object.entries(sentiment_trend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, score]) => ({
      year,
      sentiment: score,
      color: score > 0.1 ? '#00ff88' : score < -0.1 ? '#ff4444' : '#ffa500',
    }))

  return (
    <div className="sentiment-trend">
      <h3 className="component-label">SENTIMENT TREND — Financial Health Proxy</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="year"
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              domain={[-1, 1]}
              ticks={[-0.5, 0, 0.5]}
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3040', borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12 }}
              formatter={(value) => [value.toFixed(3), 'Sentiment']}
            />
            <ReferenceLine y={0} stroke="#2a3040" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="sentiment-legend">
        <span className="sentiment-positive">Positive (&gt;0.1)</span>
        <span className="sentiment-neutral">Neutral</span>
        <span className="sentiment-negative">Negative (&lt;-0.1)</span>
      </div>
    </div>
  )
}
