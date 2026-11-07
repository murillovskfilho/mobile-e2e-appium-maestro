import { expect } from '@wdio/globals'

import { PRODUCTS } from '../../src/data/catalog.js'
import { catalogScreen } from '../../src/screens/CatalogScreen.js'
import { productScreen } from '../../src/screens/ProductScreen.js'
import { freshApp } from '../../src/support/app.js'

const isSorted = <T>(values: T[], compare: (a: T, b: T) => number) =>
  values.every((value, i) => i === 0 || compare(values[i - 1] as T, value) <= 0)

const byName = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' })

describe('Catalog', () => {
  before(async () => {
    await freshApp()
    await catalogScreen.waitUntilShown()
  })

  it('@smoke lists products with a name and a price', async () => {
    const items = await catalogScreen.visibleItems()

    expect(items.length).toBeGreaterThanOrEqual(2)
    for (const item of items) {
      expect(item.name).toMatch(/\S/)
      expect(item.price).toBeGreaterThan(0)
    }
  })

  // The grid is checked on what is on screen: sorting must hold for the first rows the user sees.
  it('sorts by name, A to Z', async () => {
    await catalogScreen.sortBy('nameAsc')
    const names = (await catalogScreen.visibleItems()).map(i => i.name)
    expect(isSorted(names, byName)).toBe(true)
  })

  it('sorts by name, Z to A', async () => {
    await catalogScreen.sortBy('nameDesc')
    const names = (await catalogScreen.visibleItems()).map(i => i.name)
    expect(isSorted(names, (a, b) => byName(b, a))).toBe(true)
  })

  it('sorts by price, lowest first', async () => {
    await catalogScreen.sortBy('priceAsc')
    const items = await catalogScreen.visibleItems()

    expect(isSorted(items.map(i => i.price), (a, b) => a - b)).toBe(true)
    // The cheapest product in the catalog leads the list.
    expect(items[0]?.price).toBe(PRODUCTS.onesie.price)
  })

  it('sorts by price, highest first', async () => {
    await catalogScreen.sortBy('priceDesc')
    const items = await catalogScreen.visibleItems()

    expect(isSorted(items.map(i => i.price), (a, b) => b - a)).toBe(true)
    expect(items[0]?.price).toBe(PRODUCTS.fleeceJacket.price)
  })

  it('opens a product with the same name and price it had in the list', async () => {
    await catalogScreen.sortBy('nameAsc')
    await catalogScreen.openProduct(PRODUCTS.backpack.name)
    await productScreen.waitUntilShown()

    expect(await productScreen.title()).toBe(PRODUCTS.backpack.name)
    expect(await productScreen.price()).toBe(PRODUCTS.backpack.price)
    expect(await productScreen.quantity()).toBe(1)
  })
})
