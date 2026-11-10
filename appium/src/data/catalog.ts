// Reference data for the app under test (My Demo App 2.3.0). Prices are in dollars as shown in the UI.

export const SORT_OPTIONS = {
  nameAsc: 'Ascending order by name',
  nameDesc: 'Descending order by name',
  priceAsc: 'Ascending order by price',
  priceDesc: 'Descending order by price',
} as const

export type SortOption = keyof typeof SORT_OPTIONS

/**
 * KNOWN DEFECT in the app (intentional, for demos): tapping the product in the 2nd grid position, or in
 * the 7th position or later, crashes the app (ProductCatalogFragment builds a 6-entry array with a null in
 * slot 1). Tests that need a product therefore sort the catalog so that product lands in the 1st position.
 * `known-defects.spec.ts` pins the crash itself, so a fix is noticed.
 */
export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99, firstWhenSortedBy: 'nameAsc' },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99, firstWhenSortedBy: 'priceAsc' },
} as const satisfies Record<string, { name: string; price: number; firstWhenSortedBy: SortOption }>

export type Product = (typeof PRODUCTS)[keyof typeof PRODUCTS]

/** The most expensive item in the catalog (several Fleece Jacket colours share it). */
export const HIGHEST_PRICE = 49.99

/** "$ 29.99" or "$29.99" → 29.99 */
export const parsePrice = (text: string): number => {
  const value = Number(text.replace(/[^0-9.]/g, ''))
  if (Number.isNaN(value)) throw new Error(`Not a price: "${text}"`)
  return value
}

/** Money arithmetic in cents, so 4 × 29.99 + 5.99 is 125.95 and not 125.94999999999999. */
export const totalOf = (lines: Array<{ price: number; quantity: number }>): number =>
  lines.reduce((cents, line) => cents + Math.round(line.price * 100) * line.quantity, 0) / 100
