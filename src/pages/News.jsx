// src/components/NewsCard.jsx
import { ExternalLink, Zap } from 'lucide-react'

export default function NewsCard({ item }) {
  const isBreaking = item.time && (Date.now() / 1000 - item.time) < 1800
  const isNew = item.time && (Date.now() / 1000 - item.time) < 7200

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        padding: '16px',
        background: 'var(--surface)',
        border: `1px solid var(--border)`,
        borderRadius: 12,
        transition: 'background 120ms',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: item.sourceColor,
        borderRadius: '12px 0 0 12px',
        opacity: 0.85,
      }} />

      <div style={{
        display: 'flex',
        gap: 12,
        paddingLeft: 8,
      }}>
        {item.image && (
          <img
            src={item.image}
            alt=""
            style={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
            flexWrap: 'wrap',
          }}>
            {isBreaking && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#ef4444',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                padding: '2px 6px',
                borderRadius: 5,
              }}>
                <Zap size={8} fill="#ef4444" /> BREAKING
              </span>
            )}
            {!isBreaking && isNew && (
              <span style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#10b981',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                padding: '2px 6px',
                borderRadius: 5,
              }}>NEW</span>
            )}
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: item.sourceColor,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {item.sourceEmoji} {item.source}
            </span>
            <span style={{
              fontSize: 10,
              color: 'var(--text-muted)',
            }}>·</span>
            <span style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {item.time ? ago(item.time) : ''}
            </span>
            <ExternalLink size={11} style={{
              color: 'var(--text-muted)',
              marginLeft: 'auto',
            }} />
          </div>
          <p style={{
            fontSize: 14,
            lineHeight: 1.45,
            color: 'var(--text-primary)',
            fontWeight: 500,
            margin: 0,
            fontFamily: 'JetBrains Mono, monospace',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.title}
          </p>
        </div>
      </div>
    </a>
  )
}

function ago(ts) {
  if (!ts) return ''
  const m = Math.floor((Date.now() / 1000 - ts) / 60)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}