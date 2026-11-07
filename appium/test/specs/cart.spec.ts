import { expect } from '@wdio/globals'

import { PRODUCTS, totalOf, type Product } from '../../src/data/catalog.js'
import { cartScreen } from '../../src/screens/CartScreen.js'
import { catalogScreen } from '../../src/screens/CatalogScreen.js'
import { header } from '../../src/screens/Header.js'
import { productScreen } from '../../src/screens/ProductScreen.js'
import { freshApp } from '../../src/support/app.js'

async function addToCart(product: Product, quantity = 1) {
  await header.goTo('Catalog')
  await catalogScreen.waitUntilShown()
  await catalogScreen.openProduct(product.name)
  await productScreen.waitUntilShown()
  await productScreen.increase(quantity - 1)
  await productScreen.addToCart()
}

describe('Cart', () => {
  beforeEach(async () => {
    await freshApp()
    await catalogScreen.waitUntilShown()
  })

  it('@smoke adding a product updates the cart badge', async () => {
    expect(await header.cartCount()).toBe(0)

    await addToCart(PRODUCTS.backpack)

    await header.waitForCartCount(1)
  })

  it('a quantity of zero disables Add to cart, and never goes negative', async () => {
    await catalogScreen.openProduct(PRODUCTS.bikeLight.name)
    await productScreen.waitUntilShown()

    await productScreen.decrease(2)
    expect(await productScreen.quantity()).toBe(0)
    expect(await productScreen.canAddToCart()).toBe(false)

    await productScreen.increase(2)
    expect(await productScreen.quantity()).toBe(2)
    expect(await productScreen.canAddToCart()).toBe(true)
  })

  it('totals several products and quantities in cents, without rounding drift', async () => {
    await addToCart(PRODUCTS.backpack, 3)
    await addToCart(PRODUCTS.onesie, 2)
    await header.waitForCartCount(5)

    await header.openCart()
    await cartScreen.waitUntilShown()

    expect(await cartScreen.quantityOf(PRODUCTS.backpack.name)).toBe(3)
    expect(await cartScreen.quantityOf(PRODUCTS.onesie.name)).toBe(2)
    expect(await cartScreen.itemCount()).toBe(5)
    expect(await cartScreen.total()).toBe(
      totalOf([
        { price: PRODUCTS.backpack.price, quantity: 3 },
        { price: PRODUCTS.onesie.price, quantity: 2 },
      ]),
    )
  })

  it('changing a quantity in the cart updates the total and the badge', async () => {
    await addToCart(PRODUCTS.fleeceJacket)
    await header.openCart()
    await cartScreen.waitUntilShown()

    await cartScreen.increase(PRODUCTS.fleeceJacket.name)

    expect(await cartScreen.quantityOf(PRODUCTS.fleeceJacket.name)).toBe(2)
    expect(await cartScreen.total()).toBe(totalOf([{ price: PRODUCTS.fleeceJacket.price, quantity: 2 }]))
    await header.waitForCartCount(2)
  })

  it('removing the last item shows the empty state', async () => {
    await addToCart(PRODUCTS.boltTShirt)
    await header.openCart()
    await cartScreen.waitUntilShown()

    await cartScreen.remove(PRODUCTS.boltTShirt.name)

    await browser.waitUntil(() => cartScreen.isEmpty(), { timeoutMsg: 'empty cart state never showed' })
    expect(await header.cartCount()).toBe(0)
  })
})
