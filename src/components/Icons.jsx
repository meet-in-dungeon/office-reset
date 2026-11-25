// 화면에 쓰는 작은 선 아이콘 모음. 외부 아이콘 패키지 없이 SVG로 직접 그린다. (담당: 김민지)
// 색은 글자색(currentColor)을 따른다. 모두 장식이라 화면 낭독기에서는 숨긴다.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

export const AlarmIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9v4.2l2.6 1.6M4.5 4.5 7 3M19.5 4.5 17 3" />
  </svg>
)

export const PlayIcon = (props) => (
  <svg {...base} fill="currentColor" stroke="none" {...props}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
  </svg>
)

export const ChartIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="11" width="4" height="9" rx="1" />
    <rect x="10" y="4" width="4" height="16" rx="1" />
    <rect x="16" y="14" width="4" height="6" rx="1" />
  </svg>
)

export const GearIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
  </svg>
)

export const ChevronIcon = ({ dir = 'right', style, ...props }) => (
  <svg
    {...base}
    {...props}
    style={dir === 'right' ? style : { transform: `rotate(${{ down: 90, left: 180, up: 270 }[dir]}deg)`, ...style }}
  >
    <path d="m9 5 7 7-7 7" />
  </svg>
)

export const BellIcon = (props) => (
  <svg {...base} fill="currentColor" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 3a6 6 0 0 0-6 6v3.2c0 .7-.3 1.4-.8 1.9L4 15.5V17h16v-1.5l-1.2-1.4a2.8 2.8 0 0 1-.8-1.9V9a6 6 0 0 0-6-6Z" />
    <path d="M9.8 19.5a2.3 2.3 0 0 0 4.4 0" fill="none" />
  </svg>
)

export const LockIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
  </svg>
)

export const CheckIcon = (props) => (
  <svg {...base} strokeWidth="3" {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const CalendarCheckIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4" />
  </svg>
)

export const AlertIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </svg>
)

export const MedalIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="14.5" r="5.5" />
    <path d="m9 3 3 5.5L15 3M10.2 14.5l1.2 1.2 2.4-2.4" />
  </svg>
)
