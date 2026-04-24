import { useCallback, useEffect, useState } from 'react'
import { getPathForRoute, resolveRouteFromPath } from '../lib/routing/appRoute'
import type { AppRoute, ViewName } from '../types/app-route'

export const useAppRoute = () => {
  const [route, setRoute] = useState<AppRoute>(() => resolveRouteFromPath(window.location.pathname))

  useEffect(() => {
    const normalizedRoute = resolveRouteFromPath(window.location.pathname)
    const normalizedPath = getPathForRoute(normalizedRoute)

    if (window.location.pathname !== normalizedPath) {
      window.history.replaceState(normalizedRoute, '', normalizedPath)
    }

    const handlePopState = () => {
      setRoute(resolveRouteFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const navigateToRoute = useCallback((nextRoute: AppRoute) => {
    setRoute(nextRoute)

    const nextPath = getPathForRoute(nextRoute)
    if (window.location.pathname !== nextPath) {
      window.history.pushState(nextRoute, '', nextPath)
    }
  }, [])

  const navigateToView = useCallback(
    (viewName: ViewName) => {
      if (viewName === 'products') {
        navigateToRoute({ view: 'products', screen: 'list' })
        return
      }

      navigateToRoute({ view: viewName })
    },
    [navigateToRoute],
  )

  return {
    route,
    navigateToRoute,
    navigateToView,
  }
}
