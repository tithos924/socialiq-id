import { cn } from "@/lib/utils"

interface SocialScoreDialProps {
  /** 0–100. Pass null/undefined for the pre-analysis empty state. */
  score: number | null
  size?: number
  className?: string
}

/**
 * The product's signature visual: the Social Score rendered as an analog
 * instrument dial, not a generic "big number" card. Ticks mark every 10
 * points; the arc fills from 7 o'clock to 5 o'clock (300° sweep), amber
 * for the filled portion, sage for the remainder.
 */
export function SocialScoreDial({ score, size = 200, className }: SocialScoreDialProps) {
  const radius = 80
  const center = 100
  const startAngle = 150 // degrees, 0 = 3 o'clock, clockwise
  const sweep = 240

  const angleToPoint = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    }
  }

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = startAngle + (sweep * i) / 10
    const outer = angleToPoint(angle)
    const rad = (angle * Math.PI) / 180
    const innerRadius = i % 5 === 0 ? radius - 10 : radius - 6
    const inner = {
      x: center + innerRadius * Math.cos(rad),
      y: center + innerRadius * Math.sin(rad),
    }
    return { outer, inner, major: i % 5 === 0 }
  })

  const clamped = score === null ? 0 : Math.max(0, Math.min(100, score))
  const fillAngle = startAngle + (sweep * clamped) / 100
  const needle = angleToPoint(fillAngle)

  const describeArc = (fromDeg: number, toDeg: number) => {
    const from = angleToPoint(fromDeg)
    const to = angleToPoint(toDeg)
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0
    return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`
  }

  return (
    <div className={cn("inline-flex flex-col items-center", className)} style={{ width: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={score === null ? "Social Score ainda não calculado" : `Social Score ${score} de 100`}>
        {/* Track */}
        <path
          d={describeArc(startAngle, startAngle + sweep)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Fill */}
        {score !== null && (
          <path
            d={describeArc(startAngle, fillAngle)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={10}
            strokeLinecap="round"
          />
        )}
        {/* Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke="var(--muted-foreground)"
            strokeWidth={t.major ? 1.5 : 1}
            opacity={t.major ? 0.5 : 0.25}
          />
        ))}
        {/* Needle */}
        {score !== null && (
          <line
            x1={center}
            y1={center}
            x2={needle.x}
            y2={needle.y}
            stroke="var(--primary)"
            strokeWidth={2}
          />
        )}
        <circle cx={center} cy={center} r={4} fill="var(--primary)" />

        <text
          x={center}
          y={center + 38}
          textAnchor="middle"
          className="font-mono"
          fontSize={28}
          fontWeight={600}
          fill="var(--foreground)"
        >
          {score === null ? "—" : score}
        </text>
        <text
          x={center}
          y={center + 56}
          textAnchor="middle"
          fontSize={10}
          letterSpacing="0.05em"
          fill="var(--muted-foreground)"
        >
          {score === null ? "SEM DADOS" : "/ 100"}
        </text>
      </svg>
    </div>
  )
}
