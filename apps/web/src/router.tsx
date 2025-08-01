import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { orpcClient, queryClient, queryUtils } from './utils/orpc'
import type { RouterAppContext } from './routes/__root'

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: {
      orpcClient,
      queryClient,
      queryUtils,
    } as RouterAppContext,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}