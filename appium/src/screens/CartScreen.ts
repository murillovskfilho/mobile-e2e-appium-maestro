import { $ } from '@wdio/globals'

import { parsePrice } from '../data/catalog.js'
import { APP_PACKAGE, byDesc, byId } from '../support/selectors.js'
import { BaseScreen } from './BaseScreen.js'

const rid = (id: string) => `${APP_PACKAGE}:id/${id}`

class CartScreen extends BaseScreen {
  // Either the filled cart or the empty state: both mean the cart screen is up.
  protected readonly anchor = `android=new UiSelector().resourceIdMatches("${APP_PACKAGE}:id/(cartBt|noItemTitleTV)")`

  /**
   * A control in the cart row of one product. Rows have no per-item id, so this is the one place an XPath
   * is the clearest locator: from the product's title, up to the nearest ancestor that also holds the
   * control, then down to it. Works whatever the row's internal nesting is.
   */
  //
  // The XPath is scoped to one direct child of the list (one row), so it can never fall through to the
  // row above. A row partly below the fold is not fully in the UI tree, so the list is nudged until the
  // control is on screen.
  private async row(name: string, childId: string) {
    const control = $(
      `//*[@resource-id="${rid('productRV')}"]/*[.//*[@resource-id="${rid('titleTV')}" and @text="${name}"]]` +
        `//*[@resource-id="${rid(childId)}"]`,
    )
    await this.scrollToText(name)
    for (let nudge = 0; nudge < 3 && !(await control.isExisting()); nudge++) {
      await driver.execute('mobile: scrollGesture', {
        elementId: await $(byId('productRV')).elementId,
        direction: 'down',
        percent: 0.4,
      })
    }
    return control
  }

  async isEmpty(): Promise<boolean> {
    return $(byId('noItemTitleTV')).isDisplayed()
  }

  async quantityOf(name: string): Promise<number> {
    return Number(await (await this.row(name, 'noTV')).getText())
  }

  async increase(name: string) {
    await (await this.row(name, 'plusIV')).click()
  }

  async decrease(name: string) {
    await (await this.row(name, 'minusIV')).click()
  }

  async remove(name: string) {
    await (await this.row(name, 'removeBt')).click()
  }

  async itemCount(): Promise<number> {
    // "3 Items"
    return Number((await this.textOf('itemsTV')).replace(/\D/g, ''))
  }

  async total(): Promise<number> {
    return parsePrice(await this.textOf('totalPriceTV'))
  }

  async proceedToCheckout() {
    await $(byDesc('Confirms products for checkout')).click()
  }

  async goShopping() {
    await this.tap('shoppingBt')
  }
}

export const cartScreen = new CartScreen()
