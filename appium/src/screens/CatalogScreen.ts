import { $, $$ } from '@wdio/globals'

import { parsePrice, SORT_OPTIONS, type Product, type SortOption } from '../data/catalog.js'
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
   * Opens a product's page. Sorts first so the product is the first card (see the known defect in
   * `data/catalog.ts`), checks that it is, then taps its image: the title is not tappable in this app.
   */
  async openProduct(product: Product) {
    await this.sortBy(product.firstWhenSortedBy)
    const first = (await this.visibleItems())[0]
    if (first?.name !== product.name) {
      throw new Error(`Expected "${product.name}" first after sorting by ${product.firstWhenSortedBy}, got "${first?.name}"`)
    }
    await this.tapCardImage(0)
  }

  /** Taps the image of the card at this position among the cards on screen (0 = first). */
  async tapCardImage(position: number) {
    const images = await $$(`id=${APP_PACKAGE}:id/productIV`)
    const image = images[position]
    if (!image) throw new Error(`No product card at position ${position}`)
    await image.click()
  }
}

export const catalogScreen = new CatalogScreen()
