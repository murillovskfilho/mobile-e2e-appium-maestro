import { $ } from '@wdio/globals'

import { byId, scrollToId, scrollToText } from '../support/selectors.js'

export abstract class BaseScreen {
  /** An element that is only on screen when this screen is shown. */
  protected abstract readonly anchor: string

  async waitUntilShown(timeout = 20_000): Promise<this> {
    await $(this.anchor).waitForDisplayed({ timeout })
    return this
  }

  async isShown(): Promise<boolean> {
    return $(this.anchor).isDisplayed()
  }

  protected el(id: string) {
    return $(byId(id))
  }

  protected async tap(id: string) {
    await this.el(id).click()
  }

  /** Taps an element that may be below the fold, scrolling the screen's container first. */
  protected async tapAfterScroll(id: string) {
    const element = await $(scrollToId(id))
    await element.click()
  }

  protected async type(id: string, value: string) {
    const field = await $(scrollToId(id))
    await field.clearValue()
    await field.setValue(value)
    await this.hideKeyboard()
  }

  protected async textOf(id: string): Promise<string> {
    return this.el(id).getText()
  }

  protected async scrollToText(text: string) {
    return $(scrollToText(text))
  }

  async hideKeyboard() {
    if (await driver.isKeyboardShown()) {
      await driver.hideKeyboard()
    }
  }
}
