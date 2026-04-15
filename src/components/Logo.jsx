export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="yoyai-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Black rounded background */}
      <rect width="40" height="40" rx="9" fill="#0a0a0a" />

      {/* Stem */}
      <path
        d="M20 30 Q20 22 20 18"
        stroke="#7ee8f8"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        filter="url(#yoyai-glow)"
      />

      {/* Left leaf */}
      <path
        d="M20 18 Q15 13 12 10 Q15 12 20 18"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="white"
        opacity="0.95"
        filter="url(#yoyai-glow)"
      />
      {/* Left leaf vein */}
      <path
        d="M20 18 Q16 14 13 11"
        stroke="#7ee8f8"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Right leaf */}
      <path
        d="M20 18 Q25 14 29 12 Q25 15 20 18"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="white"
        opacity="0.95"
        filter="url(#yoyai-glow)"
      />
      {/* Right leaf vein */}
      <path
        d="M20 18 Q24 15 28 13"
        stroke="#7ee8f8"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Cyan glow halo behind plant */}
      <ellipse cx="20" cy="19" rx="8" ry="7" fill="#00d4ff" opacity="0.07" />
    </svg>
  )
}
