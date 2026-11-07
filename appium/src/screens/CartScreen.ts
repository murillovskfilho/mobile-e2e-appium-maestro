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
  private row(name: string, childId: string) {
    return $(
      `//*[@resource-id="${rid('titleTV')}" and @text="${name}"]` +
        `/ancestor::*[.//*[@resource-id="${rid(childId)}"]][1]//*[@resource-id="${rid(childId)}"]`,
    )
  }

  async isEmpty(): Promise<boolean> {
    return $(byId('noItemTitleTV')).isDisplayed()
  }

  async quantityOf(name: string): Promise<number> {
    return Number(await this.row(name, 'noTV').getText())
  }

  async increase(name: string) {
    await this.row(name, 'plusIV').click()
  }

  async decrease(name: string) {
    await this.row(name, 'minusIV').click()
  }

  async remove(name: string) {
    await this.row(name, 'removeBt').click()
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
