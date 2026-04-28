import { useState } from 'react'

const API_BASE = 'video.bykadov.com'  // user will change this

const QUALITY_OPTIONS = [
  { label: 'Best', value: 'best' },
  { label: '1080p', value: '1080p' },
  { label: '720p', value: '720p' },
  { label: '480p', value: '480p' },
  { label: 'Audio only', value: 'audio' },
]

export default function App() {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('best')
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleDownload() {
    if (!url.trim()) {
      setStatus('error')
      setErrorMsg('Please enter a YouTube URL.')
      return
    }
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setStatus('error')
      setErrorMsg('Only YouTube links are supported.')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(
        `${API_BASE}/download?url=${encodeURIComponent(url)}&quality=${quality}`
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Download failed.')
      }

      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i)
      const filename = match ? decodeURIComponent(match[1]) : 'video.mp4'

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      a.click()
      URL.revokeObjectURL(objectUrl)

      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong.')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleDownload()
  }

  return (
    <div style={styles.card}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>▶</span> SaveIt
      </div>
      <p style={styles.tagline}>Paste a YouTube link. That&apos;s it.</p>

      <input
        style={styles.input}
        type="text"
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div style={styles.qualityRow}>
        {QUALITY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            style={quality === opt.value ? styles.qualityBtnActive : styles.qualityBtn}
            onClick={() => setQuality(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        style={status === 'loading' ? { ...styles.downloadBtn, opacity: 0.6 } : styles.downloadBtn}
        onClick={handleDownload}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Downloading...' : 'Download'}
      </button>

      {status === 'loading' && (
        <div style={styles.statusLoading}>
          This can take 10–30 seconds...
        </div>
      )}

      {status === 'done' && (
        <div style={styles.statusDone}>
          ✓ Done! Check your Downloads folder.
        </div>
      )}

      {status === 'error' && (
        <div style={styles.statusError}>
          {errorMsg}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    maxWidth: '480px',
    width: '100%',
    margin: '0 auto',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  logo: {
    fontSize: '1.6rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  logoIcon: {
    color: '#E24B4A',
  },
  tagline: {
    color: '#888',
    fontSize: '0.95rem',
    marginTop: '-0.25rem',
  },
  input: {
    width: '100%',
    height: '44px',
    background: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#f1f1f1',
    padding: '0 12px',
    fontSize: '0.95rem',
    outline: 'none',
  },
  qualityRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  qualityBtn: {
    background: '#222',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#aaa',
    padding: '6px 12px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  qualityBtnActive: {
    background: '#333',
    border: '1px solid #555',
    borderRadius: '6px',
    color: '#fff',
    padding: '6px 12px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  downloadBtn: {
    width: '100%',
    height: '44px',
    background: '#E24B4A',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statusLoading: {
    background: '#1f1f1f',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#888',
    fontSize: '0.9rem',
  },
  statusDone: {
    background: '#0d2b1a',
    border: '1px solid #1a5c35',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#4ade80',
    fontSize: '0.9rem',
  },
  statusError: {
    background: '#2b0d0d',
    border: '1px solid #5c1a1a',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#f87171',
    fontSize: '0.9rem',
  },
}
