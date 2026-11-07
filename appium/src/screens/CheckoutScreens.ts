import { $ } from '@wdio/globals'

import { parsePrice } from '../data/catalog.js'
import type { PAYMENT, SHIPPING } from '../data/users.js'
import { byDesc, byId, byText } from '../support/selectors.js'
import { BaseScreen } from './BaseScreen.js'

type Shipping = { -readonly [K in keyof typeof SHIPPING]: string }
type Payment = { -readonly [K in keyof typeof PAYMENT]: string }

// Anchors are the step headings at the top of each screen; the action buttons sit below the fold.
class ShippingAddressScreen extends BaseScreen {
  protected readonly anchor = byText('Enter a shipping address')

  async fill(address: Partial<Shipping>) {
    const fields: Array<[keyof Shipping, string]> = [
      ['fullName', 'fullNameET'],
      ['address1', 'address1ET'],
      ['address2', 'address2ET'],
      ['city', 'cityET'],
      ['state', 'stateET'],
      ['zip', 'zipET'],
      ['country', 'countryET'],
    ]
    for (const [key, id] of fields) {
      const value = address[key]
      if (value !== undefined) await this.type(id, value)
    }
  }

  async continueToPayment() {
    await this.tapAfterScroll('paymentBtn')
  }

  /** Error messages currently shown under the required fields. */
  async visibleErrors(): Promise<string[]> {
    // The submit button is at the bottom; scroll back to the top of the form before reading the errors.
    await this.scrollToText('Enter a shipping address')
    const ids = ['fullNameErrorTV', 'address1ErrorTV', 'cityErrorTV', 'zipErrorTV', 'countryErrorTV']
    const errors: string[] = []
    for (const id of ids) {
      const el = $(byId(id))
      if ((await el.isExisting()) && (await el.isDisplayed())) errors.push(await el.getText())
    }
    return errors
  }
}

class PaymentScreen extends BaseScreen {
  protected readonly anchor = byText('Enter a payment method')

  async fill(card: Payment) {
    await this.type('nameET', card.fullName)
    await this.type('cardNumberET', card.cardNumber)
    await this.type('expirationDateET', card.expiration)
    await this.type('securityCodeET', card.securityCode)
  }

  async reviewOrder() {
    await this.tapAfterScroll('paymentBtn')
  }
}

class ReviewOrderScreen extends BaseScreen {
  protected readonly anchor = byText('Review your order')

  async deliveryName(): Promise<string> {
    return this.textOf('fullNameTV')
  }

  async total(): Promise<number> {
    const el = await $(`android=new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().resourceIdMatches(".*:id/totalAmountTV"))`)
    return parsePrice(await el.getText())
  }

  async placeOrder() {
    await this.tapAfterScroll('paymentBtn')
  }
}

class CheckoutCompleteScreen extends BaseScreen {
  protected readonly anchor = byId('completeTV')

  async heading(): Promise<string> {
    return this.textOf('completeTV')
  }

  async continueShopping() {
    await $(byDesc('Tap to open catalog')).click()
  }
}

export const shippingAddressScreen = new ShippingAddressScreen()
export const paymentScreen = new PaymentScreen()
export const reviewOrderScreen = new ReviewOrderScreen()
export const checkoutCompleteScreen = new CheckoutCompleteScreen()
