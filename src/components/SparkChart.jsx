import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

function fmt(n) {
  return n?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) ?? '—'
}

export default function SparkChart({ data, color = '#6366f1', height = 60 }) {
  if (!data || data.length < 2) {
    return <div className="h-full flex items-center justify-center text-gray-700 text-xs">Pas assez de données</div>
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, fontSize: 11 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color }}
          formatter={v => [fmt(v), 'Profit']}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark_${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
