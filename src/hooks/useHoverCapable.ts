import { useEffect, useState } from 'react'

const HOVER_QUERY = '(hover: hover) and (pointer: fine)'

function read(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true
  return window.matchMedia(HOVER_QUERY).matches
}

// 
//   Whether the current input device can genuinely hover (mouse / trackpad).
//  
//   Touch and stylus devices report false. Phones still fire `:hover` when an
//   element is tapped and the style sticks until the next tap, so hover-only
//   motion (the card lift) is gated behind this instead of `whileHover`.
//  
export function useHoverCapable(): boolean {
  const [hoverable, setHoverable] = useState(read)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(HOVER_QUERY)
    const onChange = () => setHoverable(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return hoverable
}
