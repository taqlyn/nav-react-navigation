# `@taqlyn/nav-react-navigation`

Optional **React Navigation** helpers for Taqlyn deferred / warm links.

- `mapDeferredLinkToNavAction(link)` — first path segment → screen name + params
- `navigateDeferredLink(link, navigation)` — navigate once per `linkId`
- `createTaqlynLinking({ prefixes, screens, scheme })` — `NavigationContainer` linking fragment
- `createTaqlynExpandingLinking({ linking, resolveIncomingUrl, fallbackPath })` — expand short URLs before getInitialURL
- `createTaqlynDeferredLinking({ linking, getDeferredHref, resolveIncomingUrl? })` — wait for deferred resolve once, then warm URL
- `TaqlynPendingRoute` — hold until auth/onboarding
- `subscribeWarmLinks(linking, onUrl)` — injected RN / Expo Linking (no vendor import here)

**Non-goals:** Match / resolve / Install Referrer / pasteboard. Pair with `@taqlyn/sdk-react-native` (`resolveIncomingUrl`, `TaqlynProvider`).

When React Navigation linking already handles Universal / App Links, configure SdkCore with `linkProcessingMode: 'deferred-only'` so clipboard (iOS) / Install Referrer (Android) stay on the SDK listener.

```ts
import { NavigationContainer } from '@react-navigation/native'
import {
  createTaqlynExpandingLinking,
  createTaqlynLinking,
  navigateDeferredLink,
} from '@taqlyn/nav-react-navigation'
import {
  observePlatformLinks,
  resolveIncomingUrl,
  setReadyForNavigation,
} from '@taqlyn/sdk-react-native'

const base = createTaqlynLinking({
  prefixes: ['https://go.example.com'],
  scheme: 'cenomimalls',
  screens: { Home: 'home', Malls: 'malls' },
})

const linking = createTaqlynExpandingLinking({
  linking: base,
  resolveIncomingUrl,
  fallbackPath: '/',
})

observePlatformLinks((link) => {
  navigateDeferredLink(link, navigation)
})
setReadyForNavigation(true)
```

Guides: [short-link-expand](../../docs/guides/short-link-expand.md) · [detour-parity-gaps](../../docs/guides/detour-parity-gaps.md)
