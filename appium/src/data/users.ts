// Test accounts the demo app ships with. The app accepts any non-empty password for a known user.
export const USERS = {
  standard: { username: 'bod@example.com', password: '10203040' },
  lockedOut: { username: 'alice@example.com', password: '10203040' },
} as const

export type User = (typeof USERS)[keyof typeof USERS]

export const SHIPPING = {
  fullName: 'Rebecca Winter',
  address1: 'Mandorley 112',
  address2: 'Entrance 1',
  city: 'Truro',
  state: 'Cornwall',
  zip: '89750',
  country: 'United Kingdom',
} as const

export const PAYMENT = {
  fullName: 'Rebecca Winter',
  // A test card number; the app only checks that the field is filled.
  cardNumber: '3258125675687891',
  expiration: '0325',
  securityCode: '123',
} as const
