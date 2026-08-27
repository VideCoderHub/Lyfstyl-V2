export default function MascotCharacter({ type = 'chef', size = 'md', animate = true, speech }) {
  const className = [
    'mascot',
    `mascot--${type}`,
    `mascot--${size}`,
    animate ? 'mascot--animate' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} aria-hidden={!speech}>
      <div className="mascot__stage">
        {type === 'chef' ? <ChefSvg /> : null}
        {type === 'dancer' ? <DancerSvg /> : null}
        {type === 'duo' ? (
          <div className="mascot__duo">
            <ChefSvg />
            <DancerSvg />
          </div>
        ) : null}
        <span className="mascot__shadow" />
      </div>
      {speech ? (
        <div className="mascot__bubble" role="status">
          <p>{speech}</p>
        </div>
      ) : null}
    </div>
  )
}

function ChefSvg() {
  return (
    <svg className="mascot__svg mascot__svg--chef" viewBox="0 0 120 160" fill="none">
      <ellipse cx="60" cy="148" rx="28" ry="6" fill="rgb(var(--food-rgb) / 0.25)" />
      <path className="mascot-chef-hat" d="M30 52c0-18 14-32 30-32s30 14 30 32v8H30v-8z" fill="#fff" stroke="var(--color-food)" strokeWidth="2" />
      <circle className="mascot-chef-head" cx="60" cy="72" r="22" fill="#f4c9a8" stroke="var(--color-food)" strokeWidth="2" />
      <circle cx="52" cy="70" r="2.5" fill="#2a1810" />
      <circle cx="68" cy="70" r="2.5" fill="#2a1810" />
      <path d="M54 80q6 4 12 0" stroke="#2a1810" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path className="mascot-chef-arm-l" d="M38 98 22 88" stroke="#f4c9a8" strokeWidth="8" strokeLinecap="round" />
      <path className="mascot-chef-arm-r" d="M82 98 98 82" stroke="#f4c9a8" strokeWidth="8" strokeLinecap="round" />
      <rect x="42" y="92" width="36" height="44" rx="10" fill="var(--color-food)" />
      <path className="mascot-chef-spoon" d="M98 82c8-6 14-2 12 6-1 5-8 8-12 4" stroke="#ddd" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse className="mascot-chef-pan" cx="22" cy="88" rx="10" ry="4" fill="#555" />
    </svg>
  )
}

function DancerSvg() {
  return (
    <svg className="mascot__svg mascot__svg--dancer" viewBox="0 0 120 160" fill="none">
      <ellipse cx="60" cy="148" rx="28" ry="6" fill="rgb(var(--dance-rgb) / 0.2)" />
      <circle className="mascot-dancer-head" cx="60" cy="58" r="18" fill="#c68642" stroke="var(--color-dance-deep)" strokeWidth="2" />
      <path d="M52 56h16" stroke="#2a1810" strokeWidth="2" strokeLinecap="round" />
      <circle cx="54" cy="54" r="2" fill="#2a1810" />
      <circle cx="66" cy="54" r="2" fill="#2a1810" />
      <path className="mascot-dancer-body" d="M60 76v38" stroke="var(--color-dance-deep)" strokeWidth="10" strokeLinecap="round" />
      <path className="mascot-dancer-arm-l" d="M60 84 34 64" stroke="#c68642" strokeWidth="7" strokeLinecap="round" />
      <path className="mascot-dancer-arm-r" d="M60 84 88 52" stroke="#c68642" strokeWidth="7" strokeLinecap="round" />
      <path className="mascot-dancer-leg-l" d="M60 114 42 140" stroke="#3d2914" strokeWidth="8" strokeLinecap="round" />
      <path className="mascot-dancer-leg-r" d="M60 114 78 136" stroke="#3d2914" strokeWidth="8" strokeLinecap="round" />
      <path className="mascot-dancer-skirt" d="M44 96h32l-8 24H52z" fill="var(--color-dance)" opacity="0.9" />
    </svg>
  )
}
