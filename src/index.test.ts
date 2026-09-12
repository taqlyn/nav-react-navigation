import { describe, expect, test } from 'bun:test'
import type { DeferredLink } from '@taqlyn/sdk-contract'
import {
  mapDeferredLinkToNavAction,
  navigateDeferredLink,
  createTaqlynLinking,
  TaqlynPendingRoute,
} from './index'

const link: DeferredLink = {
  url: 'https://go.example.com/home?sku=9',
  path: '/home',
  params: { sku: '9' },
  linkId: 'lnk_rn',
  matchType: 'install_referrer',
  isDeferred: true,
}

describe('nav-react-navigation', () => {
  test('mapDeferredLinkToNavAction uses first path segment', () => {
    expect(mapDeferredLinkToNavAction(link)).toEqual({
      name: 'home',
      params: { sku: '9' },
    })
  })

  test('navigateDeferredLink dedupes by linkId', () => {
    const calls: Array<{ name: string; params?: Record<string, string> }> = []
    const nav = {
      navigate: (name: string, params?: Record<string, string>) => {
        calls.push({ name, params })
      },
    }
    const consumed = new Set<string>()
    expect(navigateDeferredLink(link, nav, consumed)?.name).toBe('home')
    expect(navigateDeferredLink(link, nav, consumed)).toBeNull()
    expect(calls).toHaveLength(1)
  })

  test('createTaqlynLinking builds prefixes + screens', () => {
    const linking = createTaqlynLinking({
      prefixes: ['https://go.example.com'],
      screens: { Home: 'home', Malls: 'malls' },
      scheme: 'cenomimalls',
    })
    expect(linking.prefixes).toContain('cenomimalls://')
    expect(linking.config.screens.Home).toBe('home')
  })

  test('TaqlynPendingRoute holds until ready', () => {
    const pending = new TaqlynPendingRoute()
    pending.set({ name: 'home' })
    expect(pending.shouldHold()).toBe(true)
    pending.setReady(true)
    expect(pending.shouldHold()).toBe(false)
  })
})
