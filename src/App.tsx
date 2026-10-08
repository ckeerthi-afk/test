import { useState, type CSSProperties } from 'react'

const C = {
  stem: '#b4b0dc',
  petal: '#e5e3f5',
  core: '#a39fd2',
  accent: '#3e55d4',
  leaf: '#f1f1f3',
}

type Pt = [number, number]

function Leaf({ base, tip, w }: { base: Pt; tip: Pt; w: number }) {
  const [x1, y1] = base
  const dx = (tip[0] - x1) * 0.6
  const dy = (tip[1] - y1) * 0.6
  const x2 = x1 + dx
  const y2 = y1 + dy
  w *= 0.6
  const len = Math.hypot(dx, dy)
  const nx = (-dy / len) * w
  const ny = (dx / len) * w
  const mx = x1 + dx * 0.45
  const my = y1 + dy * 0.45
  const d = `M${x1},${y1} Q${mx + nx},${my + ny} ${x2},${y2} Q${mx - nx * 0.7},${my - ny * 0.7} ${x1},${y1} Z`
  return (
    <g>
      <path d={d} fill={C.leaf} className="leaf-flutter" style={{ transformOrigin: `${x1}px ${y1}px`, animationDelay: `${-(x1 % 7)}s` }} />
      <line x1={x1} y1={y1} x2={x1 + dx * 0.92} y2={y1 + dy * 0.92} stroke={C.stem} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

const polar = (x: number, y: number, r: number, deg: number): Pt => {
  const a = ((deg - 90) * Math.PI) / 180
  return [x + Math.cos(a) * r, y + Math.sin(a) * r]
}

const star = (x: number, y: number, ro: number, ri: number, rot = 0) =>
  Array.from({ length: 10 }, (_, i) => polar(x, y, i % 2 ? ri : ro, rot + i * 36).join(',')).join(' ')

const P = {
  petal: '#f3b3c3',
  halo: '#efb4b9',
  inner: '#fcefe7',
  ring: '#b8293d',
  eye: '#eef1cc',
  budEdge: '#e494a7',
  openPetal: '#e7869e',
  openHalo: '#d1657d',
  openInner: '#f6c3cf',
}

const pts = (list: Pt[]) => list.map((p) => p.join(',')).join(' ')

function Flower({ x, y, open: initial = false, s = 1, onHover }: { x: number; y: number; open?: boolean; s?: number; onHover?: (on: boolean) => void }) {
  const [hover, setHover] = useState(false)
  const open = initial || hover
  const corners = Array.from({ length: 5 }, (_, i) => polar(x, y, 19 * s, i * 72))
  const motion = (on: boolean, rot: number) => ({
    transformBox: 'fill-box' as const,
    transformOrigin: 'center',
    transform: on ? 'scale(1) rotate(0deg)' : `scale(0.3) rotate(${rot}deg)`,
    opacity: on ? 1 : 0,
    transition: 'transform 1100ms cubic-bezier(.22,1,.36,1), opacity 700ms cubic-bezier(.22,1,.36,1)',
  })
  return (
    <g onMouseEnter={() => (setHover(true), onHover?.(true))} onMouseLeave={() => (setHover(false), onHover?.(false))} className="cursor-pointer">
      <circle cx={x} cy={y} r={28 * s} fill="transparent" />
      <circle
        cx={x}
        cy={y}
        r={(open ? 34 : 28) * s}
        fill="url(#flower-glow)"
        style={{ opacity: open ? 1 : 0.7, transition: 'r 900ms cubic-bezier(.22,1,.36,1), opacity 900ms cubic-bezier(.22,1,.36,1)' }}
        pointerEvents="none"
      />
      <g style={motion(!open, 0)}>
        <polygon points={pts(corners)} style={{ fill: 'var(--h-petal)', stroke: 'var(--h-petal)' }} strokeWidth={4 * s} strokeLinejoin="round" />
        {corners.map(([cx, cy], i) => (
          <line key={i} x1={x} y1={y} x2={cx} y2={cy} style={{ stroke: 'var(--h-budEdge)' }} strokeWidth={1.4 * s} />
        ))}
        <circle cx={x} cy={y} r={3.2 * s} style={{ fill: 'var(--h-ring)' }} />
      </g>
      <g style={motion(open, -72)}>
        <polygon points={star(x, y, 25 * s, 14 * s)} style={{ fill: 'var(--h-openPetal)', stroke: 'var(--h-openPetal)' }} strokeWidth={6 * s} strokeLinejoin="round" />
        <circle cx={x} cy={y} r={17 * s} style={{ fill: 'var(--h-openHalo)' }} />
        <polygon points={star(x, y, 17 * s, 9.5 * s, 18)} style={{ fill: 'var(--h-openInner)', stroke: 'var(--h-openInner)' }} strokeWidth={3 * s} strokeLinejoin="round" />
        <circle cx={x} cy={y} r={7 * s} style={{ fill: 'var(--h-ring)' }} />
        <circle cx={x} cy={y} r={2.4 * s} fill={P.eye} />
      </g>
    </g>
  )
}

function Umbel({ cx, cy, points, labels, pinned = [], s = 1.5, reach, onHover }: { cx: number; cy: number; points: Pt[]; labels: (number | null)[]; pinned?: number[]; s?: number; reach: number; onHover: (t: Tag | null) => void }) {
  const tagFor = (i: number): Tag | null => {
    const n = labels[i]
    if (n == null) return null
    const [x, y] = points[i]
    return { x, y, side: x < cx ? -1 : 1, edge: cx + (x < cx ? -reach : reach), n }
  }
  return (
    <g className="umbel-sway" style={{ transformOrigin: `${cx}px ${cy - 120}px`, animationDuration: `${cx % 3 ? 8 : 10}s` }}>
      {points.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.stem} strokeWidth={2} strokeOpacity={0.4} />
      ))}
      <Flower x={cx} y={cy} s={s * 0.8} />
      {points.map(([x, y], i) => {
        const d = Math.hypot(x - cx, y - cy)
        const deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI
        const k = 1 - 0.25 * Math.min(1, Math.max(0, (d - 60 * s / 1.5) / (100 * s / 1.5)))
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${deg}) scale(${k} 1) rotate(${-deg}) translate(${-x} ${-y})`}>
            <g
              className="flower-drift"
              style={{ animationDuration: `${5 + ((i * 7) % 4)}s`, animationDelay: `${-((i * 1.3) % 6)}s` }}
            >
              <Flower
                x={x}
                y={y}
                s={s}
                open={pinned.includes(i)}
                onHover={pinned.includes(i) ? undefined : (on) => onHover(on ? tagFor(i) : null)}
              />
            </g>
          </g>
        )
      })}
      {pinned.map((i) => {
        const t = tagFor(i)
        return t && <Label key={`pin-${i}`} tag={t} />
      })}
    </g>
  )
}

const SKILLS = [
  'Research Driven', 'Competitive Analysis', 'Journey Mapping', 'User Interviews', 'User Testing',
  'Systems Thinker', 'Enterprise Workflows', 'Information Architecture', 'Product Strategy', 'Design Systems',
  'Clarity Obsessed', 'Onboarding', 'Feature Discovery', 'Workflow Simplification', 'Guided Learning',
  'AI-native', 'Builder', 'Adaptive', 'Learner', 'Designs in code', 'Collaborative', 'Curious',
  'Experimentation', 'Human centred', 'Detail obsessed', 'Story teller', 'Strategist', 'Process driven',
  'Empathetic', 'Technical',
]

type Tag = { x: number; y: number; side: number; edge: number; n: number }

function Label({ tag }: { tag: Tag }) {
  const { x, y, side, edge, n } = tag
  const anchor = side < 0 ? 'end' : 'start'
  const tx = edge + side * 14
  return (
    <g className="skill-tag" pointerEvents="none">
      <line x1={x + side * 30} y1={y} x2={edge} y2={y} stroke={T.ink} strokeWidth={1.25} pathLength={1} className="skill-line" />
      <circle cx={x + side * 30} cy={y} r={3} fill={T.ink} />
      <g transform={`rotate(45 ${edge} ${y})`}>
        <rect x={edge - 5} y={y - 5} width={10} height={10} fill={T.ink} className="skill-node" />
      </g>
      <g className="skill-text">
        <text x={tx} y={y - 16} textAnchor={anchor} fill={T.soft} fontFamily="'JetBrains Mono', monospace" fontSize={11} letterSpacing="0.18em">
          {`N° ${String(n + 1).padStart(2, '0')} / ${SKILLS.length}`}
        </text>
        <text x={tx} y={y + 11} textAnchor={anchor} fill={T.ink} fontFamily="'Roboto', sans-serif" fontWeight={400} fontSize={28} letterSpacing="-0.01em">
          {SKILLS[n]}
        </text>
      </g>
    </g>
  )
}

const T = { ink: '#2c3192', soft: '#7c80c4' }

const ring = (cx: number, cy: number, r: number, n: number, off = 0, from = 0, to = 360): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((from + ((to - from) * (i + off)) / (to - from === 360 ? n : n - 1)) * Math.PI) / 180
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt
  })

const upper: Pt[] = [...ring(495, 655, 85, 5, 0.5), ...ring(495, 655, 150, 7, 0.25), ...ring(495, 655, 210, 10)]
const lower: Pt[] = [...ring(300, 950, 95, 3, 0, 40, 140), ...ring(300, 950, 170, 5, 0, 10, 170), ...ring(300, 950, 240, 7, 0, 15, 165)]

// Flowers whose words are fixed in place. Pinned ones stay open with their label always visible.
const w = (name: string) => SKILLS.indexOf(name)
const FIXED: Record<string, [number, number]> = {
  'AI-native': [0, 20], // top of the main cluster
  Builder: [0, 17], // left of the main cluster
  'Story teller': [0, 12],
  'Human centred': [0, 18],
  Experimentation: [1, 8],
}
const PINNED = { upper: [12, 18], lower: [8] }

// Give every flower a unique word (no repeats); with more flowers than words, a few spread-out flowers stay unlabeled.
const LABELS: (number | null)[][] = [upper.map(() => null), lower.map(() => null)]
for (const [name, [c, i]] of Object.entries(FIXED)) LABELS[c][i] = w(name)
{
  const free = LABELS.flatMap((l, c) => l.map((v, i) => (v == null ? [c, i] : null)).filter((v): v is number[] => v != null))
  const rest = SKILLS.map((_, n) => n).filter((n) => !Object.keys(FIXED).map(w).includes(n))
  rest.forEach((n, j) => {
    const [c, i] = free[Math.floor((j * free.length) / rest.length)]
    LABELS[c][i] = n
  })
}

// deterministic pseudo-random so the leaves stay put across renders
const rand = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return v - Math.floor(v)
}

const FALLING = Array.from({ length: 16 }, (_, i) => ({
  left: 15 + rand(i, 1) * 115,
  size: 10 + rand(i, 2) * 14,
  duration: 16 + rand(i, 3) * 14,
  delay: -rand(i, 4) * 30,
  sway: 20 + rand(i, 5) * 50,
  spin: (rand(i, 6) > 0.5 ? 1 : -1) * (180 + rand(i, 7) * 360),
  opacity: 0.12 + rand(i, 8) * 0.16,
}))

function FallingLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {FALLING.map((l, i) => (
        <div
          key={i}
          className="falling-leaf absolute top-0"
          style={{ left: `${l.left}%`, animationDuration: `${l.duration}s`, animationDelay: `${l.delay}s` }}
        >
          <div className="falling-leaf-drift" style={{ animationDuration: `${l.duration}s`, animationDelay: `${l.delay}s` }}>
          <div
            className="falling-leaf-sway"
            style={{ '--sway': `${l.sway}px`, '--spin': `${l.spin}deg`, animationDuration: `${l.duration / 3}s`, animationDelay: `${l.delay}s` } as CSSProperties}
          >
            <svg width={l.size} height={l.size * 1.6} viewBox="0 0 20 32" style={{ opacity: l.opacity }}>
              <path d="M10,1 Q19,13 10,31 Q1,13 10,1 Z" fill="#8e8e98" />
              <line x1={10} y1={3} x2={10} y2={29} stroke="#ffffff" strokeWidth={0.8} strokeOpacity={0.6} />
            </svg>
          </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [tag, setTag] = useState<Tag | null>(null)
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white p-6 overflow-hidden">
      <FallingLeaves />
      <svg viewBox="-360 60 1490 1200" overflow="visible" className="hydrangea relative z-10 w-full max-w-[1000px] h-auto" aria-label="Geometric blue hoya illustration">
        <defs>
          <radialGradient id="flower-glow">
            <stop offset="0%" style={{ stopColor: 'var(--h-glow)', stopOpacity: 0.7 }} />
            <stop offset="55%" style={{ stopColor: 'var(--h-glow)', stopOpacity: 0.4 }} />
            <stop offset="80%" style={{ stopColor: 'var(--h-glow)', stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--h-glow)', stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <g className="branch-sway" style={{ transformOrigin: '685px 170px' }}>
        <Leaf base={[600, 205]} tip={[330, 95]} w={85} />
        <Leaf base={[485, 310]} tip={[235, 175]} w={85} />
        <Leaf base={[235, 367]} tip={[-205, 455]} w={-75} />
        <Leaf base={[480, 455]} tip={[235, 665]} w={85} />
        <Leaf base={[345, 795]} tip={[490, 955]} w={-65} />

        <g fill="none" stroke={C.stem} strokeWidth={3} strokeLinecap="round">
          <path d="M685,170 Q640,180 605,210 L490,315 L495,655" />
          <path d="M115,360 Q300,375 390,360 L490,315" />
          <path d="M125,810 Q250,815 340,785 L440,720 L495,655" />
          <path d="M340,785 L300,950" />
        </g>

        <Umbel cx={495} cy={655} points={upper} labels={LABELS[0]} pinned={PINNED.upper} s={1.8} reach={260} onHover={setTag} />
        <Umbel cx={300} cy={950} points={lower} labels={LABELS[1]} pinned={PINNED.lower} s={1.8} reach={275} onHover={setTag} />
          {tag && <Label key={`${tag.n}-${tag.x}`} tag={tag} />}
        </g>
      </svg>
    </div>
  )
}
