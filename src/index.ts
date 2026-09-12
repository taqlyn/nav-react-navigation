/**
 * Thin React Navigation helpers — map DeferredLink → route, linking config, dedupe.
 * No Match / resolve / Install Referrer / pasteboard. Pair with SdkCore.
 */

import type { DeferredLink } from '@taqlyn/sdk-contract'

export interface NavAction {
  name: string
  params?: Record<string, string>
}

export interface NavigationLike {
  navigate: (name: string, params?: Record<string, string>) => void
}

export interface LinkingLike {
  getInitialURL(): Promise<string | null>
  addEventListener(
    event: 'url',
    handler: (event: { url: string }) => void,
  ): { remove(): void }
}

/** Map path `/home` or `home` → screen name `home` + query params. */
export function mapDeferredLinkToNavAction(link: DeferredLink): NavAction {
  const trimmed = link.path.replace(/^\/+|\/+$/g, '')
  const name = trimmed.length > 0 ? trimmed.split('/')[0]! : 'Home'
  return {
    name,
    params: { ...link.params },
  }
}

/** Navigate once per linkId. */
export function navigateDeferredLink(
  link: DeferredLink,
  navigation: NavigationLike,
  consumed = new Set<string>(),
  map: (link: DeferredLink) => NavAction | null = mapDeferredLinkToNavAction,
): NavAction | null {
  if (consumed.has(link.linkId)) return null
  const action = map(link)
  if (!action) return null
  navigation.navigate(action.name, action.params)
  consumed.add(link.linkId)
  return action
}

/**
 * React Navigation `linking` config fragment.
 * Spread into `NavigationContainer linking={{ ...createTaqlynLinking(...), config }}`.
 */
export function createTaqlynLinking(options: {
  prefixes: string[]
  screens: Record<string, string>
  scheme?: string
}): {
  prefixes: string[]
  config: { screens: Record<string, string> }
} {
  const prefixes = [...options.prefixes]
  if (options.scheme) {
    prefixes.push(`${options.scheme.replace(/:\/?\/?$/, '')}://`)
  }
  return {
    prefixes,
    config: { screens: options.screens },
  }
}

export class TaqlynPendingRoute {
  action: NavAction | null = null
  ready = false

  set(action: NavAction | null): void {
    this.action = action
  }

  setReady(ready: boolean): void {
    this.ready = ready
  }

  shouldHold(): boolean {
    return !this.ready && this.action != null
  }
}

export function whenReadyNavigate(onReady: () => void): void {
  onReady()
}

/**
 * Warm OS URLs via injected Linking. Use SdkCore `linkProcessingMode: 'deferred-only'`
 * when React Navigation linking already handles UL/AL.
 */
export function subscribeWarmLinks(
  linking: LinkingLike,
  onUrl: (url: string) => void,
): () => void {
  const sub = linking.addEventListener('url', ({ url }) => {
    if (url) onUrl(url)
  })
  void linking.getInitialURL().then((url) => {
    if (url) onUrl(url)
  })
  return () => {
    sub.remove()
  }
}
