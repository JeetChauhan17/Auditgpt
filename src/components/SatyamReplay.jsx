import { useState, useEffect, useRef } from 'react'
import './SatyamReplay.css'

const YEARS = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009]
const SPEEDS = [
  { label: '1s', ms: 1000 },
  { label: '2s', ms: 2000 },
  { label: '3s', ms: 3000 },
]

export default function SatyamReplay({ onYearChange }) {
  const [currentYear, setCurrentYear] = useState(YEARS[YEARS.length - 1])
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentYear(prev => {
          const idx = YEARS.indexOf(prev)
          if (idx >= YEARS.length - 1) {
            setPlaying(false)
            return prev
          }
          return YEARS[idx + 1]
        })
      }, SPEEDS[speedIdx].ms)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, speedIdx])

  useEffect(() => {
    onYearChange?.(currentYear)
  }, [currentYear, onYearChange])

  const handlePlay = () => {
    if (currentYear >= YEARS[YEARS.length - 1]) {
      setCurrentYear(YEARS[0])
    }
    setPlaying(true)
  }

  return (
    <div className="satyam-replay">
      <h3 className="component-label">SATYAM REPLAY — Watch the fraud develop year by year</h3>
      <div className="replay-controls">
        <button
          className="replay-btn"
          onClick={() => playing ? setPlaying(false) : handlePlay()}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>

        <input
          type="range"
          min={YEARS[0]}
          max={YEARS[YEARS.length - 1]}
          step={1}
          value={currentYear}
          onChange={e => { setPlaying(false); setCurrentYear(Number(e.target.value)) }}
          className="year-slider"
        />

        <span className="current-year mono">{currentYear}</span>

        <div className="speed-controls">
          {SPEEDS.map((s, i) => (
            <button
              key={s.label}
              className={`speed-btn ${i === speedIdx ? 'active' : ''}`}
              onClick={() => setSpeedIdx(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="year-dots">
        {YEARS.map(y => (
          <div
            key={y}
            className={`year-dot-item ${y <= currentYear ? 'active' : ''} ${y === currentYear ? 'current' : ''}`}
            onClick={() => { setPlaying(false); setCurrentYear(y) }}
          >
            <div className="dot" />
            <span className="dot-year mono">{y}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
