import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps): IconProps {
  return {
    width: '1em',
    height: '1em',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    ...props,
  }
}

export const IconSun = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
  </svg>
)

export const IconMoon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 12.9A8.6 8.6 0 1 1 11.1 3a6.9 6.9 0 0 0 9.9 9.9Z" />
  </svg>
)

export const IconSearch = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m16.5 16.5 4 4" />
  </svg>
)

export const IconMenu = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconExternal = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M10 6H6.8A1.8 1.8 0 0 0 5 7.8v9.4A1.8 1.8 0 0 0 6.8 19h9.4a1.8 1.8 0 0 0 1.8-1.8V14" />
    <path d="M14 5h5v5M19 5l-8 8" />
  </svg>
)

export const IconArrowDown = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
)

export const IconRefresh = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </svg>
)

export const IconGrid = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </svg>
)

export const IconList = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
