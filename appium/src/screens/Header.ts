import { $ } from '@wdio/globals'

import { byDesc, byId, byText } from '../support/selectors.js'

/** The toolbar every main screen shares: menu, sort, cart badge. */
export class Header {
  async cartCount(): Promise<number> {
    const badge = $(byId('cartTV'))
    if (!(await badge.isDisplayed())) return 0
    return Number(await badge.getText())
  }

  async waitForCartCount(expected: number) {
    await browser.waitUntil(async () => (await this.cartCount()) === expected, {
      timeout: 10_000,
      timeoutMsg: `cart badge never showed ${expected}`,
    })
  }

  async openCart() {
    await $(byDesc('View cart')).click()
  }

  async openSort() {
    await $(byDesc('Shows current sorting order and displays available sorting options')).click()
  }

  async openMenu() {
    await $(byDesc('View menu')).click()
    await $(byId('menuRV')).waitForDisplayed()
  }

  async goTo(menuItem: 'Catalog' | 'Log In' | 'Log Out' | 'About') {
    await this.openMenu()
    await $(byText(menuItem)).click()
  }
}

export const header = new Header()
