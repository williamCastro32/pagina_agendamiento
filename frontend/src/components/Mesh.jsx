/** Drifting radial-gradient backdrop used on every dark section. */
export default function Mesh({ layers, spread = '' }) {
  return (
    <div className={`mesh ${spread}`} aria-hidden="true">
      {layers.map((layer, i) => (
        <div
          key={i}
          className="mesh__layer"
          style={{
            background: layer.background,
            filter: `blur(${layer.blur ?? 14}px)`,
            animation: `${layer.animation ?? 'meshDrift'} ${layer.duration ?? 16}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

export const HERO_MESH = [
  { background: 'radial-gradient(circle at 26% 30%,rgba(42,88,145,.9),transparent 46%)', blur: 12, animation: 'meshDrift', duration: 15 },
  { background: 'radial-gradient(circle at 80% 24%,rgba(58,110,168,.75),transparent 44%)', blur: 14, animation: 'meshDrift2', duration: 18 },
  { background: 'radial-gradient(circle at 62% 86%,rgba(164,48,42,.4),transparent 42%)', blur: 16, animation: 'meshDrift', duration: 21 },
  { background: 'radial-gradient(circle at 12% 82%,rgba(212,161,61,.35),transparent 40%)', blur: 16, animation: 'meshDrift2', duration: 19 },
]

export const CTA_MESH = [
  {
    background:
      'radial-gradient(circle at 30% 40%,rgba(58,110,168,.7),transparent 45%),' +
      'radial-gradient(circle at 75% 60%,rgba(212,161,61,.4),transparent 45%)',
    blur: 16,
    duration: 16,
  },
]

export const PANEL_MESH = [
  {
    background:
      'radial-gradient(circle at 30% 50%,rgba(58,110,168,.6),transparent 50%),' +
      'radial-gradient(circle at 80% 50%,rgba(212,161,61,.4),transparent 50%)',
    blur: 14,
    duration: 15,
  },
]

export const CONFIRM_MESH = [
  {
    background:
      'radial-gradient(circle at 30% 30%,rgba(58,110,168,.6),transparent 45%),' +
      'radial-gradient(circle at 75% 65%,rgba(212,161,61,.42),transparent 45%),' +
      'radial-gradient(circle at 55% 90%,rgba(164,48,42,.35),transparent 45%)',
    blur: 16,
    duration: 16,
  },
]
