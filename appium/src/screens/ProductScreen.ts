import { $ } from '@wdio/globals'

import { parsePrice } from '../data/catalog.js'
import { byId, scrollToId } from '../support/selectors.js'
import { BaseScreen } from './BaseScreen.js'

class ProductScreen extends BaseScreen {
  // The rating row sits above the fold and exists only on this screen; Add to cart is below the fold.
  protected readonly anchor = byId('rattingLL')

  // Title and price sit at the top of a scrolling page: scroll them back into view before reading,
  // since the page may have been scrolled down to reach Add to cart.
  async title(): Promise<string> {
    return (await $(scrollToId('productTV'))).getText()
  }

  async price(): Promise<number> {
    return parsePrice(await (await $(scrollToId('priceTV'))).getText())
  }

  async quantity(): Promise<number> {
    const counter = await $(scrollToId('noTV'))
    return Number(await counter.getText())
  }

  async increase(times = 1) {
    for (let i = 0; i < times; i++) await this.tapAfterScroll('plusIV')
  }

  async decrease(times = 1) {
    for (let i = 0; i < times; i++) await this.tapAfterScroll('minusIV')
  }

  async canAddToCart(): Promise<boolean> {
    const button = await $(scrollToId('cartBt'))
    return button.isEnabled()
  }

  async addToCart() {
    await this.tapAfterScroll('cartBt')
  }
}

export const productScreen = new ProductScreen()
