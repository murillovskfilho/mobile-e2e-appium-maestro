import { $, $$ } from '@wdio/globals'

import { parsePrice, SORT_OPTIONS, type SortOption } from '../data/catalog.js'
import { APP_PACKAGE, byDesc, byId } from '../support/selectors.js'
import { BaseScreen } from './BaseScreen.js'
import { header } from './Header.js'

export type CatalogItem = { name: string; price: number }

class CatalogScreen extends BaseScreen {
  protected readonly anchor = byDesc('Displays all products of catalog')

  /** The products currently rendered on screen, in display order (left to right, top to bottom). */
  async visibleItems(): Promise<CatalogItem[]> {
    const names = await $$(byId('titleTV')).map(el => el.getText())
    const prices = await $$(byId('priceTV')).map(el => el.getText())
    // A row cut by the bottom edge can show a title without its price: keep complete pairs only.
    return names.slice(0, prices.length).map((name, i) => ({ name, price: parsePrice(prices[i] ?? '') }))
  }

  async sortBy(option: SortOption) {
    await header.openSort()
    await $(byDesc(SORT_OPTIONS[option])).click()
    await this.waitUntilShown()
  }

  /**
   * Only the product image opens the product page; the title is not tappable. Scrolls the title into view,
   * then taps the image of the same grid cell.
   */
  async openProduct(name: string) {
    await this.scrollToText(name)
    await $(`//*[@resource-id="${APP_PACKAGE}:id/titleTV" and @text="${name}"]/../*[@resource-id="${APP_PACKAGE}:id/productIV"]`).click()
  }
}

export const catalogScreen = new CatalogScreen()
