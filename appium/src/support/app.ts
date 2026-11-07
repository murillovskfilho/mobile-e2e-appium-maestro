import { $ } from '@wdio/globals'

import { APP_PACKAGE } from './selectors.js'

/**
 * Restarts the app with its data cleared, so a test never inherits a cart or a login from the one before.
 * Cheaper than a new session: the app stays installed and the UiAutomator2 server keeps running.
 */
export async function freshApp() {
  const catalog = $('~Displays all products of catalog')
  // A cold start right after clearing data is occasionally left on a blank window on a CI emulator
  // (software GPU). Relaunching fixes it; a real startup bug would fail every attempt. Same policy as the
  // `retry` in maestro/subflows/launch_fresh.yaml.
  for (let attempt = 1; attempt <= 3; attempt++) {
    await driver.execute('mobile: clearApp', { appId: APP_PACKAGE })
    await driver.execute('mobile: activateApp', { appId: APP_PACKAGE })
    if (await catalog.waitForDisplayed({ timeout: 30_000 }).catch(() => false)) return

    const source = await driver.getPageSource()
    const packages = [...new Set(source.match(/package="[^"]+"/g) ?? [])].join(', ')
    console.warn(`freshApp: catalog not shown after launch ${attempt}/3; on screen: ${packages || 'nothing'}`)
    await driver.saveScreenshot(`./logs/fresh-app-attempt-${attempt}-${Date.now()}.png`).catch(() => undefined)
    await driver.execute('mobile: terminateApp', { appId: APP_PACKAGE })
    await driver.execute('mobile: pressKey', { keycode: 3 }) // HOME: closes any system dialog left on top
  }
  throw new Error('The app did not show the catalog after 3 launches')
}

/** Sends the app to the background for a while and brings it back, like a user switching apps. */
export async function backgroundFor(seconds: number) {
  await driver.execute('mobile: backgroundApp', { seconds })
}

export async function appState(): Promise<number> {
  return driver.execute('mobile: queryAppState', { appId: APP_PACKAGE }) as Promise<number>
}
