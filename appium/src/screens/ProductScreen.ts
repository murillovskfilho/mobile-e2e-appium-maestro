import { parsePrice } from '../data/catalog.js'
import { byDesc } from '../support/selectors.js'
import { BaseScreen } from './BaseScreen.js'

class ProductScreen extends BaseScreen {
  protected readonly anchor = byDesc('Tap to add product to cart')

  async title(): Promise<string> {
    return this.textOf('productTV')
  }

  async price(): Promise<number> {
    return parsePrice(await this.textOf('priceTV'))
  }

  async quantity(): Promise<number> {
    return Number(await this.textOf('noTV'))
  }

  async increase(times = 1) {
    for (let i = 0; i < times; i++) await this.tapAfterScroll('plusIV')
  }

  async decrease(times = 1) {
    for (let i = 0; i < times; i++) await this.tapAfterScroll('minusIV')
  }

  async canAddToCart(): Promise<boolean> {
    return this.el('cartBt').isEnabled()
  }

  async addToCart() {
    await this.tapAfterScroll('cartBt')
  }
}

export const productScreen = new ProductScreen()
