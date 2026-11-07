import { expect } from '@wdio/globals'

import { PRODUCTS } from '../../src/data/catalog.js'
import { catalogScreen } from '../../src/screens/CatalogScreen.js'
import { header } from '../../src/screens/Header.js'
import { productScreen } from '../../src/screens/ProductScreen.js'
import { appState, backgroundFor, freshApp } from '../../src/support/app.js'

// What a real user does between taps: switch apps, rotate, come back later. Things Maestro can't script.
const RUNNING_IN_FOREGROUND = 4

describe('App lifecycle', () => {
  beforeEach(async () => {
    await freshApp()
    await catalogScreen.waitUntilShown()
  })

  it('keeps the cart and the current screen after going to the background', async () => {
    await catalogScreen.openProduct(PRODUCTS.backpack)
    await productScreen.waitUntilShown()
    await productScreen.addToCart()
    await header.waitForCartCount(1)

    await backgroundFor(3)

    expect(await appState()).toBe(RUNNING_IN_FOREGROUND)
    await productScreen.waitUntilShown()
    expect(await productScreen.title()).toBe(PRODUCTS.backpack.name)
    expect(await header.cartCount()).toBe(1)
  })

  it('stays in portrait when the device is rotated', async () => {
    // The app locks its activities to portrait, so Android refuses the rotation.
    const rotation = await driver.setOrientation('LANDSCAPE').then(
      () => 'rotated',
      (error: Error) => error.message,
    )

    expect(rotation).toContain('locked')
    expect(await driver.getOrientation()).toBe('PORTRAIT')
    await catalogScreen.waitUntilShown()
  })
})
