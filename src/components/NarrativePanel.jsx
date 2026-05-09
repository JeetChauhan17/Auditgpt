import { useState, useEffect, useRef } from 'react'
import './NarrativePanel.css'

export default function NarrativePanel({ companyId, cachedNarrative }) {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const textRef = useRef(null)

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    // If we have a cached narrative, stream it locally for effect
    if (cachedNarrative) {
      setText('')
      setStreaming(true)
      let i = 0
      const interval = setInterval(() => {
        const chunk = cachedNarrative.slice(i, i + 3)
        if (i >= cachedNarrative.length) {
          clearInterval(interval)
          setStreaming(false)
          return
        }
        setText(prev => prev + chunk)
        i += 3
      }, 10)
      return () => clearInterval(interval)
    }

    // Otherwise, stream from SSE
    setText('')
    setStreaming(true)
    const evtSource = new EventSource(`${API}/api/stream/${companyId}`)

    evtSource.onmessage = (e) => {
      if (e.data === '[DONE]') {
        evtSource.close()
        setStreaming(false)
        return
      }
      setText(prev => prev + e.data)
    }

    evtSource.onerror = () => {
      evtSource.close()
      setStreaming(false)
    }

    return () => evtSource.close()
  }, [companyId, cachedNarrative])

  // Auto-scroll as text streams in
  useEffect(() => {
    if (textRef.current && streaming) {
      textRef.current.scrollTop = textRef.current.scrollHeight
    }
  }, [text, streaming])

  return (
    <div className="narrative-panel">
      <h3 className="component-label">
        AI FORENSIC NARRATIVE
        {streaming && <span className="streaming-indicator">● STREAMING</span>}
      </h3>
      <div className="narrative-content" ref={textRef}>
        {text || <span className="narrative-placeholder">Generating forensic analysis...</span>}
        {streaming && <span className="cursor">▊</span>}
      </div>
    </div>
  )
}
