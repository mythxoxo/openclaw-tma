export function Skeleton({ lines = 4, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`tma-skeleton ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="tma-skeleton-line"
          style={{ width: `${100 - (i % 3) * 18}%`, height: i === 0 ? 18 : 16 }}
        />
      ))}
    </div>
  )
}
