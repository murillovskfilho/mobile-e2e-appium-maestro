import { expect } from '@wdio/globals'

import { PRODUCTS, totalOf } from '../../src/data/catalog.js'
import { PAYMENT, SHIPPING, USERS } from '../../src/data/users.js'
import { cartScreen } from '../../src/screens/CartScreen.js'
import { catalogScreen } from '../../src/screens/CatalogScreen.js'
import {
  checkoutCompleteScreen,
  paymentScreen,
  reviewOrderScreen,
  shippingAddressScreen,
} from '../../src/screens/CheckoutScreens.js'
import { header } from '../../src/screens/Header.js'
import { loginScreen } from '../../src/screens/LoginScreen.js'
import { productScreen } from '../../src/screens/ProductScreen.js'
import { freshApp } from '../../src/support/app.js'

async function cartWithBackpack() {
  await catalogScreen.openProduct(PRODUCTS.backpack)
  await productScreen.waitUntilShown()
  await productScreen.addToCart()
  await header.waitForCartCount(1)
  await header.openCart()
  await cartScreen.waitUntilShown()
}

describe('Checkout', () => {
  beforeEach(async () => {
    await freshApp()
    await catalogScreen.waitUntilShown()
  })

  it('@smoke a guest is asked to log in, then completes an order end to end', async () => {
    await cartWithBackpack()
    await cartScreen.proceedToCheckout()

    // Not logged in: checkout goes through login and comes back to the shipping step.
    await loginScreen.waitUntilShown()
    await loginScreen.login(USERS.standard)

    await shippingAddressScreen.waitUntilShown()
    await shippingAddressScreen.fill(SHIPPING)
    await shippingAddressScreen.continueToPayment()

    await paymentScreen.waitUntilShown()
    await paymentScreen.fill(PAYMENT)
    await paymentScreen.reviewOrder()

    await reviewOrderScreen.waitUntilShown()
    expect(await reviewOrderScreen.deliveryName()).toBe(SHIPPING.fullName)

    await reviewOrderScreen.placeOrder()

    await checkoutCompleteScreen.waitUntilShown()
    expect(await checkoutCompleteScreen.heading()).toBe('Checkout Complete')
  })

  it('the review step shows the cart total plus delivery', async () => {
    await cartWithBackpack()
    const cartTotal = await cartScreen.total()
    expect(cartTotal).toBe(totalOf([{ price: PRODUCTS.backpack.price, quantity: 1 }]))

    await cartScreen.proceedToCheckout()
    await loginScreen.waitUntilShown()
    await loginScreen.login(USERS.standard)
    await shippingAddressScreen.waitUntilShown()
    await shippingAddressScreen.fill(SHIPPING)
    await shippingAddressScreen.continueToPayment()
    await paymentScreen.waitUntilShown()
    await paymentScreen.fill(PAYMENT)
    await paymentScreen.reviewOrder()
    await reviewOrderScreen.waitUntilShown()

    // DHL standard delivery is a flat $5.99 in this app.
    expect(await reviewOrderScreen.total()).toBe(totalOf([{ price: cartTotal, quantity: 1 }, { price: 5.99, quantity: 1 }]))
  })

  it('the shipping step refuses to continue with required fields empty', async () => {
    await cartWithBackpack()
    await cartScreen.proceedToCheckout()
    await loginScreen.waitUntilShown()
    await loginScreen.login(USERS.standard)
    await shippingAddressScreen.waitUntilShown()

    // Only the optional fields are filled.
    await shippingAddressScreen.fill({ address2: SHIPPING.address2, state: SHIPPING.state })
    await shippingAddressScreen.continueToPayment()

    expect(await shippingAddressScreen.isShown()).toBe(true)
    expect(await paymentScreen.isShown()).toBe(false)
    expect(await shippingAddressScreen.visibleErrors()).toContain('Please provide your full name.')
  })
})
