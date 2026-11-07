import { APP_PACKAGE } from './selectors.js'

/**
 * Restarts the app with its data cleared, so a test never inherits a cart or a login from the one before.
 * Cheaper than a new session: the app stays installed and the UiAutomator2 server keeps running.
 */
export async function freshApp() {
  await driver.execute('mobile: clearApp', { appId: APP_PACKAGE })
  await driver.execute('mobile: activateApp', { appId: APP_PACKAGE })
}

/** Sends the app to the background for a while and brings it back, like a user switching apps. */
export async function backgroundFor(seconds: number) {
  await driver.execute('mobile: backgroundApp', { seconds })
}

export async function appState(): Promise<number> {
  return driver.execute('mobile: queryAppState', { appId: APP_PACKAGE }) as Promise<number>
}
