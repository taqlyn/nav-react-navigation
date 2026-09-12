# `@taqlyn/nav-react-navigation`

Optional **React Navigation** helpers for Taqlyn deferred / warm links.

- `mapDeferredLinkToNavAction(link)` — first path segment → screen name + params
- `navigateDeferredLink(link, navigation)` — navigate once per `linkId`
- `createTaqlynLinking({ prefixes, screens, scheme })` — `NavigationContainer` linking fragment
- `TaqlynPendingRoute` — hold until auth/onboarding
- `subscribeWarmLinks(linking, onUrl)` — injected RN / Expo Linking (no vendor import here)

**Non-goals:** Match / resolve / Install Referrer / pasteboard. Pair with `@taqlyn/sdk-react-native`.

When React Navigation linking already handles Universal / App Links, configure SdkCore with `linkProcessingMode: 'deferred-only'` so clipboard (iOS) / Install Referrer (Android) stay on the SDK listener.

```ts
import { NavigationContainer } from '@react-navigation/native'
import { createTaqlynLinking, navigateDeferredLink } from '@taqlyn/nav-react-navigation'
import { observePlatformLinks, setReadyForNavigation } from '@taqlyn/sdk-react-native'

const linking = createTaqlynLinking({
  prefixes: ['https://go.example.com'],
  scheme: 'cenomimalls',
  screens: { Home: 'home', Malls: 'malls' },
})

observePlatformLinks((link) => {
  navigateDeferredLink(link, navigation)
})
setReadyForNavigation(true)
```
