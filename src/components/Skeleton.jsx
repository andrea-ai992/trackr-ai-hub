/** Shimmer skeleton primitives. All use the .skeleton CSS class for the animation. */

export function SkeletonLine({ width = '100%', height = 13, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 6, ...style }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: '#0f0f18',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonLine width="55%" />
          <SkeletonLine width="38%" height={11} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <SkeletonLine width={64} />
          <SkeletonLine width={48} height={11} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/** Pull-to-refresh spinner shown at the top of a page while dragging / refreshing */
export function PullIndicator({ progress, refreshing }) {
  const visible = progress > 0 || refreshing
  const size = 20
  const circumference = Math.PI * size
  const dashOffset = circumference * (1 - (refreshing ? 1 : progress))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: visible ? 44 : 0,
        overflow: 'hidden',
        transition: 'height 0.2s ease',
        pointerEvents: 'none',
      }}
    >
      <svg
        width={size + 4}
        height={size + 4}
        viewBox={`0 0 ${size + 4} ${size + 4}`}
        style={{
          transform: `rotate(${refreshing ? 0 : progress * 270 - 90}deg)`,
          transition: refreshing ? 'none' : 'transform 0.1s ease',
          animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
        }}
      >
        <circle
          cx={(size + 4) / 2}
          cy={(size + 4) / 2}
          r={size / 2}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={2}
        />
        <circle
          cx={(size + 4) / 2}
          cy={(size + 4) / 2}
          r={size / 2}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: refreshing ? 'none' : 'stroke-dashoffset 0.1s ease' }}
        />
      </svg>
    </div>
  )
}
