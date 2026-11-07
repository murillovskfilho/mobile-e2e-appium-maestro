import { expect } from '@wdio/globals'

import { catalogScreen } from '../../src/screens/CatalogScreen.js'
import { appState, freshApp } from '../../src/support/app.js'

/**
 * Characterisation tests for defects that are known and accepted for now. They assert the current, wrong
 * behaviour on purpose: while the bug exists they pass; the day it is fixed they fail, which is the signal
 * to turn them into normal tests and to drop the workaround in `CatalogScreen.openProduct`.
 *
 * Found by this suite: opening some products crashed the app on CI. Logcat showed
 *   java.lang.ArrayIndexOutOfBoundsException: length=6; index=6
 *     at ProductCatalogFragment.lambda$setAdapter$0 (ProductCatalogFragment.java:156)
 * and the source has `Integer[] meta = { 0, null, 2, 3, 4, 5 }`, marked as an intentional demo bug.
 */
const RUNNING_IN_FOREGROUND = 4

describe('Known defects', () => {
  beforeEach(async () => {
    await freshApp()
  })

  it('@known-defect tapping the 2nd product in the catalog crashes the app', async () => {
    await catalogScreen.tapCardImage(1)

    await browser.waitUntil(async () => (await appState()) !== RUNNING_IN_FOREGROUND, {
      timeout: 15_000,
      timeoutMsg: 'The app is still running: the known crash may be fixed. Turn this into a normal test.',
    })
  })

  it('tapping the 1st product does not crash (the workaround the other tests rely on)', async () => {
    await catalogScreen.tapCardImage(0)

    await browser.pause(2_000)
    expect(await appState()).toBe(RUNNING_IN_FOREGROUND)
  })
})
