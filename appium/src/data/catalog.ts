// Reference data for the app under test (My Demo App 2.3.0). Prices are in dollars as shown in the UI.
export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99 },
} as const

export type Product = (typeof PRODUCTS)[keyof typeof PRODUCTS]

export const SORT_OPTIONS = {
  nameAsc: 'Ascending order by name',
  nameDesc: 'Descending order by name',
  priceAsc: 'Ascending order by price',
  priceDesc: 'Descending order by price',
} as const

export type SortOption = keyof typeof SORT_OPTIONS

/** "$ 29.99" or "$29.99" → 29.99 */
export const parsePrice = (text: string): number => {
  const value = Number(text.replace(/[^0-9.]/g, ''))
  if (Number.isNaN(value)) throw new Error(`Not a price: "${text}"`)
  return value
}

/** Money arithmetic in cents, so 3 × 29.99 is 89.97 and not 89.97000000000001. */
export const totalOf = (lines: Array<{ price: number; quantity: number }>): number =>
  lines.reduce((cents, line) => cents + Math.round(line.price * 100) * line.quantity, 0) / 100
