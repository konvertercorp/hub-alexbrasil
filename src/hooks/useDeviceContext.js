import { useEffect, useState } from 'react'

function detectMobileUserAgent() {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

function detectStandalone() {
  if (typeof window === 'undefined') return false
  const isStandaloneMedia = window.matchMedia(
    '(display-mode: standalone)',
  ).matches
  const isIosStandalone = window.navigator.standalone === true
  return isStandaloneMedia || isIosStandalone
}

export function useDeviceContext() {
  const [state, setState] = useState(() => ({
    isMobile: detectMobileUserAgent() || window.innerWidth <= 1024,
    isStandalone: detectStandalone(),
  }))

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const widthQuery = window.matchMedia('(max-width: 1024px)')

    const update = () => {
      setState({
        isMobile: detectMobileUserAgent() || widthQuery.matches,
        isStandalone: detectStandalone(),
      })
    }

    mediaQuery.addEventListener('change', update)
    widthQuery.addEventListener('change', update)
    window.addEventListener('resize', update)

    return () => {
      mediaQuery.removeEventListener('change', update)
      widthQuery.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const showDashboard = state.isMobile || state.isStandalone

  return { ...state, showDashboard }
}
