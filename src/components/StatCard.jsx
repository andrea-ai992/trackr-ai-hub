export default function StatCard({ label, value, sub, color = '#6366f1', icon: Icon, trend }) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden border border-white/[0.06] bg-[#111118]"
      style={{ boxShadow: `0 0 40px ${color}0a` }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-medium tracking-wide">{label}</span>
          {Icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
              <Icon size={13} style={{ color }} />
            </div>
          )}
        </div>
        <div className="text-xl font-bold text-white tracking-tight">{value}</div>
        {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
        {trend != null && (
          <div className={`text-xs font-medium mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}
